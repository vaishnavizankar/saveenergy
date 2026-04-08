import base64
import hashlib
from cryptography.fernet import Fernet
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# ... (Previous code remains)

def get_fernet():
    """Derive a 32-byte Fernet key from the app's SECRET_KEY"""
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))

def encrypt_content(content: str) -> str:
    """Encrypt a string into a secure token"""
    if not content: return ""
    f = get_fernet()
    return f.encrypt(content.encode()).decode()

def decrypt_content(token: str) -> str:
    """Decrypt a secure token back into a string"""
    if not token: return ""
    f = get_fernet()
    try:
        return f.decrypt(token.encode()).decode()
    except Exception:
        return ""

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "sha256_crypt"], deprecated="auto")
# ... (Rest of the file)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
