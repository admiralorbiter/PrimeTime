"""Media validation logic using ffprobe and Pillow."""
import os
import subprocess
import json
import time
from pathlib import Path
from PIL import Image
import logging

logger = logging.getLogger(__name__)


def check_ffprobe_available():
    """Check if ffprobe is available in the system."""
    try:
        result = subprocess.run(
            ['ffprobe', '-version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def validate_video(file_path, asset_path):
    """
    Validate video file using ffprobe.
    
    Returns:
        dict: {
            'valid': bool,
            'error_state': str | None,
            'width': int | None,
            'height': int | None,
            'duration_ms': int | None,
            'codec_info': dict | None,
            'mime_type': str
        }
    """
    result = {
        'valid': False,
        'error_state': None,
        'width': None,
        'height': None,
        'duration_ms': None,
        'codec_info': None,
        'mime_type': 'video/mp4'
    }
    
    if not check_ffprobe_available():
        logger.warning('ffprobe not available, skipping video validation')
        result['error_state'] = 'VALIDATION_UNAVAILABLE'
        return result
    
    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        result['error_state'] = 'FILE_MISSING'
        return result
    
    # Check file size
    file_size = file_path_obj.stat().st_size
    if file_size > 500 * 1024 * 1024:  # 500 MB
        result['error_state'] = 'FILE_TOO_LARGE'
        return result
    
    try:
        # Run ffprobe to get metadata
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,width,height',
            '-show_entries', 'format=duration',
            '-of', 'json',
            str(file_path)
        ]
        
        probe_result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30
        )
        
        if probe_result.returncode != 0:
            result['error_state'] = 'CORRUPT'
            return result
        
        data = json.loads(probe_result.stdout)
        
        # Extract video stream info
        streams = data.get('streams', [])
        video_stream = next((s for s in streams if s.get('codec_name')), None)
        
        if not video_stream:
            result['error_state'] = 'INVALID_CODEC'
            return result
        
        codec_name = video_stream.get('codec_name', '').lower()
        if codec_name not in ['h264']:
            result['error_state'] = 'INVALID_CODEC'
            return result
        
        # Check audio codec
        audio_cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'a:0',
            '-show_entries', 'stream=codec_name',
            '-of', 'json',
            str(file_path)
        ]
        
        audio_result = subprocess.run(
            audio_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=10
        )
        
        audio_codec = None
        if audio_result.returncode == 0:
            audio_data = json.loads(audio_result.stdout)
            audio_streams = audio_data.get('streams', [])
            if audio_streams:
                audio_codec = audio_streams[0].get('codec_name', '').lower()
        
        # Check resolution
        width = int(video_stream.get('width', 0))
        height = int(video_stream.get('height', 0))
        
        if width > 1920 or height > 1080:
            result['error_state'] = 'RESOLUTION_TOO_HIGH'  # Warning, not error
            # Still accept the file
        
        # Get duration
        format_info = data.get('format', {})
        duration_str = format_info.get('duration')
        duration_ms = None
        if duration_str:
            try:
                duration_seconds = float(duration_str)
                duration_ms = int(duration_seconds * 1000)
            except (ValueError, TypeError):
                pass
        
        # Build codec info
        codec_info = {
            'video': codec_name,
            'audio': audio_codec if audio_codec in ['aac', 'mp3'] else None
        }
        
        if audio_codec is None:
            result['error_state'] = 'MISSING_AUDIO'  # Warning, not error
        
        result['valid'] = True
        result['width'] = width
        result['height'] = height
        result['duration_ms'] = duration_ms
        result['codec_info'] = codec_info
        
    except subprocess.TimeoutExpired:
        result['error_state'] = 'CORRUPT'
    except json.JSONDecodeError:
        result['error_state'] = 'CORRUPT'
    except Exception as e:
        logger.error(f"Error validating video {file_path}: {e}", exc_info=True)
        result['error_state'] = 'CORRUPT'
    
    return result


def validate_image(file_path):
    """
    Validate image file using Pillow.
    
    Returns:
        dict: {
            'valid': bool,
            'error_state': str | None,
            'width': int | None,
            'height': int | None,
            'mime_type': str
        }
    """
    result = {
        'valid': False,
        'error_state': None,
        'width': None,
        'height': None,
        'mime_type': None
    }
    
    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        result['error_state'] = 'FILE_MISSING'
        return result
    
    # Check file size
    file_size = file_path_obj.stat().st_size
    if file_size > 50 * 1024 * 1024:  # 50 MB
        result['error_state'] = 'FILE_TOO_LARGE'
        return result
    
    try:
        # Open and validate image
        with Image.open(file_path) as img:
            # Check format
            format_name = img.format
            if format_name not in ['JPEG', 'PNG']:
                result['error_state'] = 'INVALID_FORMAT'
                return result
            
            # Get dimensions
            width, height = img.size
            
            # Check dimensions
            if width > 6000 or height > 6000:
                result['error_state'] = 'DIMENSIONS_TOO_LARGE'  # Warning
                # Still accept
            
            # Try to load EXIF (validates integrity)
            try:
                img._getexif()
            except Exception:
                pass  # EXIF not required
            
            result['valid'] = True
            result['width'] = width
            result['height'] = height
            result['mime_type'] = f'image/{format_name.lower()}'
            
    except Exception as e:
        logger.error(f"Error validating image {file_path}: {e}", exc_info=True)
        result['error_state'] = 'CORRUPT'
    
    return result


def validate_audio(file_path):
    """
    Validate audio file using ffprobe.
    
    Returns:
        dict: {
            'valid': bool,
            'error_state': str | None,
            'duration_ms': int | None,
            'mime_type': str
        }
    """
    result = {
        'valid': False,
        'error_state': None,
        'duration_ms': None,
        'mime_type': None
    }
    
    if not check_ffprobe_available():
        logger.warning('ffprobe not available, skipping audio validation')
        result['error_state'] = 'VALIDATION_UNAVAILABLE'
        return result
    
    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        result['error_state'] = 'FILE_MISSING'
        return result
    
    # Check file size
    file_size = file_path_obj.stat().st_size
    if file_size > 100 * 1024 * 1024:  # 100 MB
        result['error_state'] = 'FILE_TOO_LARGE'
        return result
    
    try:
        # Run ffprobe
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'a:0',
            '-show_entries', 'stream=codec_name,bit_rate',
            '-show_entries', 'format=duration',
            '-of', 'json',
            str(file_path)
        ]
        
        probe_result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30
        )
        
        if probe_result.returncode != 0:
            result['error_state'] = 'CORRUPT'
            return result
        
        data = json.loads(probe_result.stdout)
        
        streams = data.get('streams', [])
        if not streams:
            result['error_state'] = 'INVALID_FORMAT'
            return result
        
        audio_stream = streams[0]
        codec_name = audio_stream.get('codec_name', '').lower()
        
        if codec_name not in ['mp3', 'aac']:
            result['error_state'] = 'INVALID_FORMAT'
            return result
        
        # Check bitrate (warning if low)
        bit_rate = audio_stream.get('bit_rate')
        if bit_rate:
            try:
                bit_rate_kbps = int(bit_rate) / 1000
                if bit_rate_kbps < 128:
                    result['error_state'] = 'LOW_BITRATE'  # Warning
            except (ValueError, TypeError):
                pass
        
        # Get duration
        format_info = data.get('format', {})
        duration_str = format_info.get('duration')
        if duration_str:
            try:
                duration_seconds = float(duration_str)
                result['duration_ms'] = int(duration_seconds * 1000)
            except (ValueError, TypeError):
                pass
        
        result['valid'] = True
        result['mime_type'] = 'audio/mpeg' if codec_name == 'mp3' else 'audio/mp4'
        
    except subprocess.TimeoutExpired:
        result['error_state'] = 'CORRUPT'
    except json.JSONDecodeError:
        result['error_state'] = 'CORRUPT'
    except Exception as e:
        logger.error(f"Error validating audio {file_path}: {e}", exc_info=True)
        result['error_state'] = 'CORRUPT'
    
    return result


def extract_video_thumbnail(file_path, output_path, width=300, height=300):
    """
    Extract first frame from video as thumbnail using ffmpeg.
    
    Returns:
        bool: True if successful, False otherwise
    """
    if not check_ffprobe_available():
        return False
    
    try:
        cmd = [
            'ffmpeg',
            '-i', str(file_path),
            '-vf', f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2',
            '-vframes', '1',
            '-q:v', '2',
            '-y',  # Overwrite output file
            str(output_path)
        ]
        
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30
        )
        
        return result.returncode == 0
        
    except Exception as e:
        logger.error(f"Error extracting video thumbnail {file_path}: {e}", exc_info=True)
        return False

