from app.database.connection import SessionLocal, engine, Base
from app.models.auth_model import RoleModel, UserModel
from app.enums.user_role_enum import UserRoleEnum 
from app.config.security import get_password_hash

# Arquivo responsável por popular o banco com dados iniciais (roles e um usuário admin)

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:

        # Populando tabela de roles com base no Enum de Roles !!!

        for role in UserRoleEnum:
    
            existing_role = db.query(RoleModel).filter(
                RoleModel.name == role.value
            ).first()

            # Cria role caso não exista
            if not existing_role:

                db.add(
                    RoleModel(name=role.value)
                )

        db.commit()

        # Criando usuarios admin/vendedor inicial
        admin_email = "admindev@admin.com"
        vendedor_email = "vendedordev@vendedor.com"

        existing_admin = db.query(UserModel).filter(
            UserModel.email == admin_email
        ).first()
        existing_vendedor = db.query(UserModel).filter(
            UserModel.email == vendedor_email
        ).first()

        # Busca role ADMIN/VENDEDOR
        admin_role = db.query(RoleModel).filter(
            RoleModel.name == UserRoleEnum.ADMIN.value
        ).first()
        vendedor_role = db.query(RoleModel).filter(
            RoleModel.name == UserRoleEnum.VENDEDOR.value
        ).first()

        # Cria vendedor apenas se não existir
        if not existing_vendedor:

            vendedor_user = UserModel(
                email=vendedor_email,
                hashed_pass=get_password_hash(
                    "Senha123"
                )
            )

            # Atribui role VENDEDOR ao usuário
            vendedor_user.role = vendedor_role

            db.add(vendedor_user)
            db.commit()
            print("Vendedor inicial criado.")

        else:
            print("Vendedor já existe.")

        # Cria admin apenas se não existir
        if not existing_admin:

            admin_user = UserModel(
                email=admin_email,
                hashed_pass=get_password_hash(
                    "Senha123"
                )
            )

            # Atribui role ADMIN ao usuário
            admin_user.role = admin_role

            db.add(admin_user)
            db.commit()
            print("Admin inicial criado.")

        else:
            print("Admin já existe.")

        print("Seed executada com sucesso.")

    finally:
        db.close()


if __name__ == "__main__":
    run_seed()