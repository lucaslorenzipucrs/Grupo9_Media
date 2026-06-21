from ..config.security import create_access_token, create_refresh_token
from app.models.auth_model import UserModel

# Arquivo responsável responsável pela geração e gerenciamento de tokens JWT

class TokenService:
   
   # Gera access token e refresh token para um usuário autenticado
    @staticmethod
    def generate_tokens(user: UserModel) -> dict:
    
        # Payload do JWT
        role = user.role

        if isinstance(role, str):
            role_name = role
        else:
            role_name = role.name if role else None

        payload = {"sub": user.email, "user_id": user.id, "role": role_name}

        access_token = create_access_token(data=payload) # JWT de acesso

        refresh_token = create_refresh_token(data=payload) # JWT de renovação

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }