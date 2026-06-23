import boto3

from app.config.settings import settings


class StorageService:

    @staticmethod
    def _client():
        return boto3.client(
            "s3",
            endpoint_url=settings.AWS_ENDPOINT,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION
        )

    @staticmethod
    def upload_file(
        file_obj,
        object_key: str,
        content_type: str
    ) -> str:
        file_obj.seek(0)

        StorageService._client().upload_fileobj(
            file_obj,
            settings.S3_BUCKET_NAME,
            object_key,
            ExtraArgs={
                "ContentType": content_type
            }
        )

        return object_key

    @staticmethod
    def delete_file(
        object_key: str
    ) -> None:
        StorageService._client().delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=object_key
        )
