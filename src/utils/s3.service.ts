import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { extname } from 'path';

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async uploadFile(file) {
    const date = new Date().toJSON();
    const dateStr = date.replace(/-|[A-Z]|\:|\./g, '');
    // 考慮上傳大頭照是使用UUID，一個人只能上傳一個
    const filename = `${dateStr}${extname(file.originalname)}`;
    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      filename,
      file.mimetype,
    );
  }

  async s3_upload(file, bucket, filename, mimetype) {
    const params = {
      Bucket: bucket,
      Key: `friends/${filename}`,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION,
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
}
