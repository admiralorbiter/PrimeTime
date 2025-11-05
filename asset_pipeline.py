"""File watcher and asset indexing."""
import os
import time
import hashlib
import uuid
import mimetypes
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileDeletedEvent, FileModifiedEvent
from models import db, Asset
from flask import current_app
import logging

logger = logging.getLogger(__name__)


class AssetHandler(FileSystemEventHandler):
    """Handle file system events for asset directories."""
    
    def __init__(self, app=None):
        self.app = app
        self.asset_types = {
            'photos': 'photo',
            'videos': 'video',
            'music': 'music',
            'logos': 'logo'
        }
    
    def _get_app(self):
        """Get Flask app context."""
        return self.app or current_app
    
    def _get_asset_type_from_path(self, file_path):
        """Determine asset type from file path."""
        path_str = str(file_path).replace('\\', '/')
        for folder, asset_type in self.asset_types.items():
            if f'/{folder}/' in path_str or path_str.startswith(folder + '/'):
                return asset_type
        return None
    
    def _generate_asset_id(self, file_path):
        """Generate a unique asset ID (UUID-based for Phase 1A)."""
        # For Phase 1A, use UUID. Future phases may use content hash.
        return str(uuid.uuid4())
    
    def _index_file(self, file_path):
        """Index a single file into the database."""
        try:
            with self._get_app().app_context():
                file_path_obj = Path(file_path)
                
                # Check if file exists
                if not file_path_obj.exists():
                    logger.warning(f"File does not exist: {file_path}")
                    return
                
                # Get asset type from path
                asset_type = self._get_asset_type_from_path(file_path)
                if not asset_type:
                    logger.debug(f"Skipping file outside asset directories: {file_path}")
                    return
                
                # Check if already indexed
                path_str = str(file_path_obj).replace('\\', '/')
                # Make path relative to assets directory
                assets_dir = Path(self._get_app().config['ASSETS_PATH'])
                try:
                    rel_path = '/' + str(file_path_obj.relative_to(assets_dir)).replace('\\', '/')
                except ValueError:
                    # File is outside assets directory
                    logger.debug(f"File outside assets directory: {file_path}")
                    return
                
                existing = Asset.query.filter_by(path=rel_path).first()
                if existing:
                    logger.debug(f"Asset already indexed: {rel_path}")
                    return
                
                # Get file metadata
                file_size = file_path_obj.stat().st_size
                mime_type, _ = mimetypes.guess_type(str(file_path_obj))
                
                # Generate asset ID
                asset_id = self._generate_asset_id(file_path)
                
                # Create asset record
                asset = Asset(
                    id=asset_id,
                    type=asset_type,
                    path=rel_path,
                    file_size_bytes=file_size,
                    mime_type=mime_type or 'application/octet-stream',
                    added_at=int(time.time()),
                    validated_at=None,  # Validation deferred to Phase 1B
                    error_state=None
                )
                
                db.session.add(asset)
                db.session.commit()
                
                logger.info(f"Indexed asset: {rel_path} (type: {asset_type}, size: {file_size})")
                
        except Exception as e:
            logger.error(f"Error indexing file {file_path}: {e}", exc_info=True)
    
    def _remove_file(self, file_path):
        """Remove file from database index."""
        try:
            with self._get_app().app_context():
                file_path_obj = Path(file_path)
                path_str = str(file_path_obj).replace('\\', '/')
                
                # Make path relative to assets directory
                assets_dir = Path(self._get_app().config['ASSETS_PATH'])
                try:
                    rel_path = '/' + str(file_path_obj.relative_to(assets_dir)).replace('\\', '/')
                except ValueError:
                    return
                
                asset = Asset.query.filter_by(path=rel_path).first()
                if asset:
                    db.session.delete(asset)
                    db.session.commit()
                    logger.info(f"Removed asset from index: {rel_path}")
                    
        except Exception as e:
            logger.error(f"Error removing file {file_path}: {e}", exc_info=True)
    
    def on_created(self, event):
        """Handle file creation."""
        if not event.is_directory:
            logger.info(f"File created: {event.src_path}")
            self._index_file(event.src_path)
    
    def on_deleted(self, event):
        """Handle file deletion."""
        if not event.is_directory:
            logger.info(f"File deleted: {event.src_path}")
            self._remove_file(event.src_path)
    
    def on_modified(self, event):
        """Handle file modification."""
        if not event.is_directory:
            logger.debug(f"File modified: {event.src_path}")
            # For Phase 1A, just log. Future phases may re-process modified files.
            # Re-indexing on modify could cause issues, so we'll skip for now.


class AssetWatcher:
    """Watch asset directories for file changes."""
    
    def __init__(self, app):
        self.app = app
        self.observer = None
        self.handler = AssetHandler(app)
    
    def start(self):
        """Start watching asset directories."""
        assets_path = Path(self.app.config['ASSETS_PATH'])
        
        # Create asset directories if they don't exist
        asset_dirs = ['photos', 'videos', 'music', 'logos']
        for dir_name in asset_dirs:
            dir_path = assets_path / dir_name
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Index existing files on startup
        self._index_existing_files()
        
        # Start watching
        self.observer = Observer()
        self.observer.schedule(self.handler, str(assets_path), recursive=True)
        self.observer.start()
        logger.info(f"Asset watcher started: {assets_path}")
    
    def stop(self):
        """Stop watching."""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("Asset watcher stopped")
    
    def _index_existing_files(self):
        """Index all existing files in asset directories."""
        assets_path = Path(self.app.config['ASSETS_PATH'])
        asset_dirs = ['photos', 'videos', 'music', 'logos']
        
        logger.info("Indexing existing files...")
        count = 0
        
        with self.app.app_context():
            for dir_name in asset_dirs:
                dir_path = assets_path / dir_name
                if dir_path.exists():
                    for file_path in dir_path.rglob('*'):
                        if file_path.is_file():
                            self.handler._index_file(file_path)
                            count += 1
        
        logger.info(f"Indexed {count} existing files")

