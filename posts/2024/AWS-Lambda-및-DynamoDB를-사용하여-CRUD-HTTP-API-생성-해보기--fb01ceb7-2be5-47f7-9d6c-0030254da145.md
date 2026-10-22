---
title: "[AWS] Lambda 및 DynamoDB를 사용하여 CRUD HTTP API 생성 해보기"
slug: AWS-Lambda-및-DynamoDB를-사용하여-CRUD-HTTP-API-생성-해보기
velogId: fb01ceb7-2be5-47f7-9d6c-0030254da145
publishedAt: "2024-11-07T02:08:21.521Z"
updatedAt: "2026-10-12T22:23:57.402Z"
tags:
  - API Gateway
  - CRUD
  - HTTP API
  - aws
  - dynamodb
  - lambda
source: "https://velog.io/@dlehddnr99/AWS-Lambda-및-DynamoDB를-사용하여-CRUD-HTTP-API-생성-해보기"
---

** 간략 구성도 **

![](https://velog.velcdn.com/images/dlehddnr99/post/59aa8ec8-b3e8-49d8-9ba3-756220ceb703/image.png)

** AWS API Gateway 개발자 가이드를 참고하여 작성해보았다. **

https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/http-api-dynamo-db.html

<hr />

### DynamoDB

AWS에서 제공하는 NoSQL 데이터베이스 서비스로 모든 규모의 고성능 제공을 한다.

인프라 관리나 확장에 대한 걱정 없이 서버리스 애플리케이션에서 데이터를 쉽게 저장 및 검색이 가능하다.

빠르고 예측 가능한 성능과 유연한 데이터 모델, AWS Lambda와 API Gateway 등 서비스와의 원활한 통합이 가능한 장점이 있다.

![](https://velog.velcdn.com/images/dlehddnr99/post/d3ad5241-17fc-4824-b78d-cc374f3761f1/image.png)

![](https://velog.velcdn.com/images/dlehddnr99/post/264538d8-6d92-4e03-8894-a80277394202/image.png)

![](https://velog.velcdn.com/images/dlehddnr99/post/7e46c5aa-1807-494c-910b-6bd5bac44e0d/image.png)

<hr />

### Lambda

서버를 관리할 필요 없이 코드를 실행할 수 있는 컴퓨팅 서비스로, 수신되는 트래픽의 양에 따라서 애플리케이션을 자동으로 조정해주는 특징이 있다.

![](https://velog.velcdn.com/images/dlehddnr99/post/6f47fb07-8b9c-4570-884a-70bd90aaddb8/image.png)

![](https://velog.velcdn.com/images/dlehddnr99/post/28467900-bf73-4527-8295-0a7dfc76c41a/image.png)

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "http-crud-tutorial-items";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          }),
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          }),
        );
        body = body.Item;
        break;
      case "GET /items":
        body = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = body.Items;
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name,
            },
          }),
        );
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
```

![](https://velog.velcdn.com/images/dlehddnr99/post/043ac6c2-3786-4cef-8300-768f2448ca23/image.png)

<hr />

### API Gateway

AWS에서 제공하는, 규모에 맞게 API 생성/게시/관리가 가능한 서비스이다.

Lambda 함수와 통합하는 RESTful API를 작성하기 쉬운 특징이 있다.

![](https://velog.velcdn.com/images/dlehddnr99/post/8840e354-7c66-4c6b-afce-797a83549dc0/image.png)

![](https://velog.velcdn.com/images/dlehddnr99/post/ee443877-502d-48be-acab-4b2f7cd837c3/image.png)

#### 경로 생성

![](https://velog.velcdn.com/images/dlehddnr99/post/294d3e38-a745-4060-b5dd-91550b0ca3cf/image.png)

#### 통합 생성

![](https://velog.velcdn.com/images/dlehddnr99/post/069dd347-64c7-4f02-9a6c-34bec5fa5dc6/image.png)

![](https://velog.velcdn.com/images/dlehddnr99/post/b8af5b72-ed70-40e1-9b1b-bd0d0d4c03b9/image.png)

#### CORS 대응

![](https://velog.velcdn.com/images/dlehddnr99/post/a9f1a350-fc98-4671-863f-fee3c497bcfd/image.png)
