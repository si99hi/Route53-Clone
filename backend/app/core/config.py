from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_name: str = "Route53 Clone API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./route53_clone.db"

    # Auth (mocked)
    jwt_secret_key: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h session

    # CORS
    frontend_origin: str = "http://localhost:3000"

    # SMTP / Email for OTP
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "siddhib011@gmail.com"
    smtp_password: str = "mvvvvumcqluprsvv"
    smtp_from_email: str = "siddhib011@gmail.com"

    # HTTPS Email APIs (bypasses outbound SMTP port block on cloud hosts like Render)
    resend_api_key: str = ""
    brevo_api_key: str = ""


settings = Settings()
