---
title: "기업 환경에서 BI를 도입한다는 것: Product Engineer의 시각화 계층 설계"
slug: 기업-환경에서-BI를-도입한다는-것-Product-Engineer의-시각화-계층-설계
velogId: 9556fb33-8407-4824-a7af-9ff95daff183
publishedAt: "2026-10-09T05:28:11.828Z"
updatedAt: "2026-10-21T14:07:23.055Z"
tags:
  - BI
  - Business Intelligence
  - context
  - data visualization
  - frontend
source: "https://velog.io/@dlehddnr99/기업-환경에서-BI를-도입한다는-것-Product-Engineer의-시각화-계층-설계"
---

> BI(Business Intelligence)의 개념과 도입 배경을 살펴보고, 이를 구현하는 과정에서 시각화 계층의 책임과 데이트 흐름을 어떻게 분리할지에 관한 기록입니다.

### Intro - 데이터는 어떠한 방식으로 의사결정으로 이어질까?

기업 내부는 수 많은 데이터가 축적된다. 트랜잭션 로그, 사용자 행동 기록, 매출 데이터 등 다양한 형태의 데이터가 데이터베이스에 저장되지만, 단순히 **데이터를 보유하는 것과 이를 활용해 의사결정을 내리는 것**은 다른 문제라고 본다.

수치 데이터 그래도는 가공되지 않은 원료라고 보면 된다. 의사결정권자나 비즈니스 담당자가 데이터에서 의미를 읽어내려면 데이터를 정제하고, 수집하여 적절한 **시각적 맥락**(Context)을 부여해야 한다.

BI는 이 과정을 수행하기 위해서 존재한다. 흩어져 있는 축적 데이터를 직관적인 정보로 전환해 조직의 의사결정 속도와 정확도를 높이는 것이 핵심이다.

### BI (Business Intelligence)

BI는 기업의 생체 데이터를 수집, 통합, 분석하여 비즈니스 의사결정을 지원하는 기술과 프로세스의 집합이라고 정의한다.

BI 플랫폼 내에서 핵심적인 역할을 하는 두 계층을 먼저 알아봤다.

- **Dashboard** : 여러 지표(KPI)와 시각화 요소를 한 화면에 모아 조직의 현재 상태를 실시간으로 모니터링 할 수 있도록 돕는 도구

- **Report** : 특정 관점이나 문제 의식에 맟춰 상세 데이터를 심도 있게 조회하고 분석할 수 있도록 정리된 문서 형태의 응답

#### 데이터 시각화 vs BI 플랫폼

그렇다면 과연 데이터 시각화와 BI 플랫폼의 차이는 무엇일까?
큰 차이 중 하나는 **동적 상호작용과 지표 정의의 지속성**에 있다고 한다.

먼저 기존 데이터 시각화의 경우, 단일 데이터 셋의 시각적 표현을 목적으로 가지며 데이터 결합도 또한 **정적/고정된 데이터 구조**에 의존하는 경우가 많다. 확장성 또한 라이브러리 차원의 옵션에 국한된다는 한계도 존재한다.

BI 플랫폼은 보다 넓은 범주를 포함한다. **비즈니스 데이터 탐색 및 의사결정 지원**을 목적으로 가지며, dynamic query, 필터링, 드릴다운 등의 데이터 결합도를 지향하여 사용자가 정의한 분석 조건/차트 설정의 데이터화 및 저장 측면에서 **공통 데이터 모델 및 시각화 계층**을 통한 확장성을 고려한다.

### 기업 환경에서 BI를 도입할 때 고려할 점

기업 환경 내에서, 특히 폐쇄 형태인 **온프레미스 (On-Premise)** 나 격리된 엔터프라이즈 환경에서 BI를 도입한다면 일반적인 B2C 웹 서비스와는 다르게 요구되는 사항이 있다.

#### RBAC/ABAC

사용자의 직급, 부서, 조직 내 역할에 따라 접근할 수 있는 데이터 범위가 제어되어야 한다. 차트 설정뿐만 아니라 쿼리 생성 / 실행 / 데이터 접근 권한 등 여러 요소들이 고려된다.

#### 네트워크 접근성 및 외부 의존성 제약

외부 인터넷 연결이 차단된 폐쇄망 환경일 경우, 외부 CDN이나 Third-Pary 기반 라이브러리의 호출이 불가능하다. 이 경우, 시각화 모듈과 렌더링 엔진은 정적 자원으로 관리 및 번들링되어야 한다.

#### 데이터 처리 거버넌스

대용량 데이터 조회 시 클라이언트 메모리 고갈을 방지하기 위한 페이징, 집계 처리 로직의 주체가 명확히 정해져야 한다.

### 프론트엔드에서는 어떻게 접근을 할까?

프론트엔드 엔지니어링의 관점에서 BI의 핵심은 **데이터와 시각화 설정 간 관계를 설계하는 것**에 있다고 한다.

이 부분과 관련해서 크게 3가지 측면에서 한번 설계 과정을 알아보았다.

#### 1. 사용자의 시각화 설정은 어떻게 표현할까?

사용자가 화면에서 차트 유형을 바꾸고, X/Y축 지표를 선택하고, 필터를 적용하는 일련의 과정은 UI 상태만으로 구성된 것은 아니고, 저장, 재사용, 검증이 가능한 **데이터 구조 (Schema)**로 표현되어야 한다.

```typescript
// Declarative Schema for Configuration Visualize Data Structure

{
   "chartType": "bar",
   "dimensions": ["created_at_month"],
   "metrics" : [{"field" : "revenue", "aggregation": "sum"}],
   "filters" : [{"field" : "region", "operator" : "equals", "value" : "KR"}]
}
```

선언적 데이터 스키마로 관리할 경우, UI 컴포넌트 상태와 독립적인 상태에서 사용자가 생성한 분석 보고서를 저장하거나 공유할 수 있는 데이터의 전달 과정이 될 수 있다.

#### 2. 데이터 조회와 시각화는 어느 영역에서 분리할 것인가?

만약 개별 차트 컴포넌트 자체가 직접 API를 호출하거나 응답된 데이터를 가공 하는 등의 과정까지 포함한다면 시각화 컴포넌트 간 재사용성이 어려워진다.

다음과 같이 두 과정을 명확히 분리하여 차트 컴포넌트는 오직 **정제된 데이터** 와 **시각화 명세**만을 전달받은 상태로 UI 렌더링에 집중하도록 설계한다.

- **Query Spec** : 사용자의 시각화 설정을 기반으로 BE가 이해할 수 있는 데이터 요청으로 변환

- **Visual Presentation** : BE로부터 수신한 정형 데이터를 차트 엔진이 이해할 수 있는 포맷으로 전환하여 UI를 그리는 단계

#### 3. 결국 차트 라이브러리의 역할은 무엇일까?

차트 라이브러리(엔진)는 View Adapter로의 역할만 수행한다.

특정 차트 라이브러리의 옵션 객체가 애플리케이션 전반의 데이터 모델이나 상태 관리 계층의 범위를 컨트롤 할 수 없도록 분리해야 한다.

### Implementation

이론적인 개념에 대해선 어느정도 감이 잡혔으나, 실제로 설계를 해보지 않은 상태에선 추상적인 설계 원칙을 체감하기 어려웠다.

아래는 3단계 구성에 맞춰 예시 컴포넌트를 활용하여 코드로 배선해본 예시이다.

**데이터 선언적 정의** -> **조회 로직의 추상화** -> **차트 라이브러리의 어댑터화**

#### 1. 사용자의 시각화 설정 : 저장/검증 가능한 데이터 스키마 설계

UI의 상태 (select 값, checkbox 등)를 그대로 렌더링에 활용하게 되면, 차트 설정 시 대시보드 DB에 저장하거나 URL 쿼리로 공유할 경우 흐름에 문제가 생길 수 있다.

```typescript
// types/visualization.ts

export type ChartType = "bar" | "line" | "table" | "kpi";
export type AggregationType = "sum" | "avg" | "count" | "max" | "min";

export type FilterSpecOperator =
  | "equals"
  | "contains"
  | "greaterThan"
  | "lessThan";

export interface FilterSpec {
  field: string;
  operator: FilterSpecOperator;
  value: string | number | boolean;
}

export interface MetricSpec {
  field: string;
  aggregation: AggregationType;
  alias?: string;
}

/* 최종 인터페이스인 VisualizationSpec이
   저장 / 재사용 / 검증의 단위가 되는 시각화 명세의 객체가 된다.
*/
export interface VisualizationSpec {
  chartType: ChartType;
  dimensions: string[]; // X axis / Grouping Criteria
  metrics: MetricSpec[]; // Y axis / Indicator Criteria
  filters: FilterSpec[];
}
```

`VisualizationSpec`이라는 인터페이스 객체를 둠으로써, UI 렌더링 트리가 제거되는 경우에서도 현재의 분석 설정을 완전하게 복원하고 `zod` 등의 체커 라이브러리로 타입 검증 또한 가능하였다.

#### 2. 데이터 조회와 시각화의 분리

재사용을 고려했을 때, 차트 컴포넌트 안에 `useEffect` 나 `fetch` 등 데이터 페칭과 관련 로직을 사용할 수 없었다.

따라서 데이터 조회 영역은 Spec을 **BE가 이해할 수 있는 Query Parameter로 변환하고**, **데이터를 정규화하는 역할**만 담당하도록 격리시켰다.

_포스트 하위 Infrastructure 영역에서 비동기 쿼리 처리 파이프라인 추가 배선에 따라 `useAsyncVisualizationQuery.ts`가 추가된다. 현재 영역에선 해당 로직은 고려하지 않고 작성하였다._

```typescript
// hooks/useVisualizationQuery.ts

import { useQuery } from "@tanstack/react-query";
import type { VisualizationSpec } from "../types/visualization";

// Query Spec Mapper
function mapSpecToApiPayload(spec: VisualizationSpec) {
  return {
    group_by: spec.dimensions,
    aggregations: spec.metrics.map((m) => `${m.aggregation}(${m.field})`),
    where: spec.filters.map((f) => ({
      column: f.field,
      op: f.operator,
      val: f.value,
    })),
  };
}

// Data Fetching & Common Normalization Hook
export function useVisualizationQuery(spec: VisualizationSpec) {
  return useQuery({
    queryKey: ["visualization-data", spec],
    queryFn: async () => {
      const payload = mapSpecToApiPayload(spec);
      const response = await fetch("/api/v1/analytics/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawData = await response.json();

      return rawData.rows as Record<string, unknown>[];
    },
    enabled: spec.dimensions.length > 0 && spec.metrics.length > 0,
  });
}
```

#### 3. View Adapter 역할만 수행하는 차트 라이브러리 컴포넌트

```typescript
// components/chart/adapters/EChartsAdapter.tsx

import ReactECharts from 'echarts-for-react';
import type { VisualizationSpec } from '../../../types/visualization';

interface ChartAdapterProps {
 	spec: VisualizationSpec;
  	data: Record<string, unknown>[];
}

// 앞서 Spec과 data 영역을 모두 분리시킨 결과, 차트 옵션 함수에서는 특정 데이터의 제약과 무관한 순수 함수로 구성이 가능하였다.
function buildEChartsOption(spec: VisualizatioSpec, data: Record<string, unknown>[]) {
  const xAxisData = data.map(row => String(row[spec.dimensions[0]] ?? ''));

  const series = spec.metrics.map(metric => ({
     name: metric.alias || `${metric.aggregation}(${metric.field})`,
	 type: spec.chartType === 'line' ? 'line' : 'bar',
     data: data.map(row => Number(row[`${metric.field}_${metric.aggregation}`] ?? 0)),
  }));

  return {
		tooltip: { trigger: 'axis' },
		xAxis: {type: 'category', data: xAxisData },
    	yAxis: {type: 'value' },
    	series,
   };
}

export function EChartsAdapter({spec, data}: ChartAdapterProps) {
	const option = buildEChartsOption(spec, data);

   return <ReactECharts option={option} style={{height: '100%', width: '100%'}} />;

}

```

#### 4. BIChartViewer 파이프라인 조립

```typescript
// components/BIChartViewer.tsx

import type { VisualizationSpec } from '../types/visualization';
import { useVisualizationQuery } from '../hooks/useVisualizationQuery';
import { EChartsAdapter } from './chart/adapters/EChartsAdapter';

interface BIChartViewerProps {
  spec: VisualizationSpec;
}

export function BIChartViewer({ spec }: BIChartViewerProps) {
   const { data, isLoading, isError, error } = useVisualizationQuery(spec);

   if (isLoading) return <div className="spinner">데이터를 불러오는 중...</div>;
   if (isError) return <div className="error-box">오류 발생: {String(error)}</div>;
   if (!data || data.length === 0) return <div className="empty-box">조회 결과가 없습니다.</div>;

  return <EChartsAdapter spec={spec} data={data} />;
}


```

해당 체계로 구성할 때 얻을 수 있는 이점은 다음과 같다.

1. 만약 차트 라이브러리를 다른 라이브러리로 전환 시, **Adapter 영역 (3번)**만 교체하면 된다.

2. **mapSpecToApiPayload** / **buildEChartsOption** 등 데이터 변환 함수를 UI 없이 단위 테스트가 가능해진다.

3. API 패칭, 스키마 관리, 렌더링 어댑터의 경계가 명확해지니 코드의 유지 보수성이 크게 향상된다.

---

위에서 프론트엔드의 구성을 완료 지었고, 이젠 백엔드에서 BI 시각화 엔드포인트를 설계할 때 고려해야 할 부분을 기술해보고자 한다.

핵심은 다음과 같았다.

1. 전달받은 스키마의 Validation
2. 동적 쿼리 생성 시 발생할 수 있는 SQL Injection
3. 임의 열 접근 차단

#### 5.Request/Response Pydantic 스키마 정의

프론트엔드의 `VisualizationSpec` 구조를 1:1로 수용하되, Pydantic의 Enum, Validation을 적용하여 허용되지 않는 집계 함수나 연산자의 입력은 차단하였다.

```python
# app/schemas/visualization.py

from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field

class ChartType(str, Enum):
	BAR = "bar"
    LINE = "line"
    TABLE = "table"
    KPI = "kpi"

class AggrgationType(str, Enum):
	SUM = "sum"
    AVG = "avg"
    COUNT = "count"
    MAX = "max"
    MIN = "min"

class FilterOperator(str, Enum):
	EQUALS = "equals"
    CONTAINS = "contains"
    GREATER_THAN = "greaterThan"
    LESS_THAN = "lessThan"

class FilterSpec(BaseModel):
	field: str
    operator : FilterOperator
    value: Any

class MetricSpec(BaseModel):
	field: str
    aggrgation: AggregationType
    alias: Optional[str] = None


class VisualizationQueryRequest(BaseModel):
	chart_type: Optional[ChartType] = Field(default=ChartType.BAR, alias="chartType")
    dimensions: List[str] = Field(..., min_length=1, description="그룹화 기준 컬럼 목록")
    metrics: List[MetricSpec] = Field(..., min_length=1, description="집계 대상 지표 목록")
    filters: List[FilterSpec] = Field(default_factory=list, description="필터 조건 목록")

	class Config:
    	populate_by_name = True

class VisualizationQueryResponse(BaseModel):
	rows: List[dict[str, Any]]
    total_count: int
```

#### 6. Query Builder Service Layer

프론트엔드에서 보내준 field 문자열을 그대로 SQL에 삽입한다면 SQL Injection 및 데이터 유출 위험이 생긴다.

검증 없이 쿼리 문자열에 합칠 경우, 악의적인 사용자가 SQL 구문을 조작하는 문자열을 보냈을 때 쿼리 구조 자체가 변경되어 취약점이 발생할 수도 있다.

허용된 컬럼 화이트리스트(Whitelist)기반으로 SQLAlchemy 표현식을 조립해서 이를 방지하고자 했다.

```python
# app/services/query_builder.py

from typing import Any, Dict, List
from sqlalchemy import Column, Select, Table, MetaData, select, func, column
from fastapi import HTTPException, status
from app.schemas.visualization import VisualizationQueryRequest, AggregationType, FilterOperator


ALLOWED_COLUMNS: Dict[str, str] = {
	"created_at_month": "created_at_month",
    "region": "region_code",
    "revenue": "sales_amount",
    "quantity": "order_quantity"
}

AGGREGATION_MAP = {
	AggregationType.SUM: func.sum,
    AggregationType.AVG: func.avg,
    AggregationType.COUNT: func.count,
    AggregationType.MAX: func.max,
    AggregationType.MIN: func.min,
}

class QueryBuilder:
	def __init__(self, table_name: str = "analytics_fact"):
    	self.table_name = table_name

    def _validate_column(self, field_name: str) -> str:
    	"""앞서 정의한 화이트리스트에 없는 컬럼은 접근 시 차단시킨다."""

        if field_name not in ALLOWED_COLUMNS:
        	raise HTTPException(
            	status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or unauthorized field: {field_name}"
            )
        return ALLOWED_COLUMNS[field_name]

   def build_query(self, spec: VisualizationQueryRequest) -> Select:
   		select_cols = []
        group_by_cols = []

        for dim in spec.dimensions:
        	db_col_name = self._validate_column(dim)
            col = column(db_col_name).label(dim)
            select_cols.append(col)
            group_by_cols.append(column(db_col_name))

        for metric in spec.metrics:
        	db_col_name = self._validate_column(metric.field)
            agg_func = AGGREGATION_MAP[metric.aggregation]

            alias_name = metric.alias or f"{metric.field}_{metric.aggregation.value}"
			select_cols.append(agg_func(column(db_col_name)).label(alias_name))

       query = select(*select_cols).select_from(Table(self.table_name, MetaData()))

       for f in spec.filters:
       	  db_col_name = self._validate_column(f.field)
          col = column(db_col_name)

          if f.operator == FilterOperator.EQUALS:
          	    query = query.where(col == f.value)
          elif f.operator == FilterOperator.GREATER_THAN:
                query = query.where(col > f.value)
          elif f.operator == FilterOperator.LESS_THAN:
                query = query.where(col < f.value)
          elif f.operator == FilterOperator.CONTAINS:
                query = query.where(col.like(f"%{f.value}%"))

       if group_by_cols:
           query = query.group_by(*group_by_cols)

       return query

```

#### 7. FastAPI Router

앞서 검증된 스키마를 수신하여 DB 실행 후, 프론트엔드에게 `List[dict]` 형태로 결과 값을 보내주도록 한다.

```python
# app/api/v1/endpoints/analytics.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.schemas.visualization import VisualizationQueryRequest, VisualizationQueryResponse
from app.services.query_builder import QueryBuilder
from app.core.database import get_db_session  # AsyncSession Dependency

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post(
    "/query",
    response_model=VisualizationQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="BI 시각화 데이터 조회"
)
async def execute_visualization_query(
    spec: VisualizationQueryRequest,
    db: AsyncSession = Depends(get_db_session)
):
	try:
       builder = QueryBuilder(table_name="sales_analytics_view")
       statement = builder.build_query(spec)

       result = await db.excute(statement)
       mappings = result.mappings().all()

       rows = [dict(row) for row in mappings]

       return VisualizationQueryResponse(
       		rows=rows,
            total_count=len(rows)
       )
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute analytics query."
        ) from e

```

#### 8. 최종 데이터 흐름 상태

Request Paylod

```json
{
  "chartType": "bar",
  "dimensions": ["created_at_month"],
  "metrics": [
    {
      "field": "revenue",
      "aggregation": "sum"
    }
  ],
  "filters": [
    {
      "field": "region",
      "operator": "equals",
      "value": "KR"
    }
  ]
}
```

Executed SQL - Dynamically Created internal by Query Builder

```sql
SELECT
	created_at_month AS created_at_month,
    sum(sales_amount) AS revenue_sum
FROM sales_analytics_view
WHERE region_code = 'KR'
GROUP BY created_at_month
```

Response Payload

```json
{
  "rows": [
    {
      "created_at_month": "2026-01",
      "revenue_sum": 15000000
    },
    {
      "created_at_month": "2026-02",
      "revenue_sum": 18500000
    }
  ],
  "total_count": 2
}
```

백엔드 설계의 이점은 다음과 같았다.

1. **Pydantic 스키마 단계**에서 잘못된 연산자나 스키마 미준수 요청을 DB에 접근하기 이전에 차단한다.

2. 문자열 포매팅(f"SELECT {field}...")으로 바로 전송하는 단계 대신에, **화이트리스트 매핑과 SQLAlchemy AST**를 통해 검증된 쿼리만 생성한다.

3. 인프라 종속성 분리 : 데이터베이스 테이블 구조나 컬럼명이 변경되더라도 **ALLOWED_COLUMNS 매핑 테이블만 수정**하면 되기 때문에, 프론트엔드 측의 VisualizationSpec 인터페이스의 계약에 영향을 주지 않는다.

---

### InfraStructure

앞서 배선한 프론트엔드/백엔드를 기업 환경 내 BI 인프라 구축 시 고려해야 하는 문제는
**대용량 집계 쿼리의 DB 부하, HTTP 타임아웃, 그리고 폐쇄망(Air-Gapped) 배포 제약**이라고 한다.

사실 아직 인프라 단계까지의 구성을 진행해보진 않았고, 앞으로 해결해야 하는 작업인데 먼저 구성 과정에 대해서 살펴보았다.

#### 1. Query Caching Layer - Spec Based Deterministic Hashing

BI 대시보드를 여러 사용자가 동일한 판넬 내에서 동시에 조회를 하거나, 동일한 사용자가 필터 중 일부만 변경하며 데이터를 반복 요청하는 패턴이 빈번하다고 한다.

이때, RDB나 DW로 집계 쿼리가 매번 직접 전달이 된다면 DB CPU점유율이 급증할 수 있다.

```python

# app/core/cache.py

import hashlib
import json
from typing import Optional
from redis.asyncio import Redis
from app.schemas.visualization import VisualizationQueryRequest

class QueryCacheManager:
	def __init__(self, redis_client: Redis, ttl_seconds: int = 300):
        self.redis = redis_client
        self.ttl = ttl_seconds

    def generate_cache_key(self, spec: VisualizationQueryRequest) -> str:

    	spec_dict = spec.model_dump(by_alias=True)
        sorted_spec_json = json.dumps(spec_dict, sort_keys=True)

        # SHA256 해시 생성
        # VisualizationSpec 객체를 통해 넘어오는 선언적 구조의 객체를 정렬한 후 SHA-256으로 해싱하여 Caching Key로 사용한다.

        hash_digest = hashlib.sha256(sorted_spec_json.encode('utf-8')).hexdigest()

        return f"bi:query:cache:{hash_digest}"


    async def get_cached_result(self, cache_key: str) -> Optional[dict]:
        cached_data = await self.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        return None

    async def set_cache_result(self, cache_key: str, data: dict) -> None:
        await self.redis.set(cache_key, json.dumps(data), ex=self.ttl)

```

동일한 차트 설정을 요청할 경우 DB 쿼리를 재 실행하지 않고, Redis에서 캐시된 결과를 반환하도록 한다.

#### 2. synchronize/asynchronize query duarlization (Long-Running Query)

수년 치 데이터를 GROUP BY 하는 집계 쿼리는 실행 시간이 30초를 초과하여 Nginx나 AWS ALB의 HTTP Gateway Timeout(504 Error)를 유발할 수 있다.

이를 방지하기 위해서 쿼리 복잡도나 실행 시간에 따라 **Sync REST API**와 **Async Job Queue(Celery/Redis + Polling or SSE)** 방식으로 이원하 하는 방법이 있다고 한다.

```python
# app/worker/tasks.py

import asyncio
import json
from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.redis import redis_client
from app.schemas.visualization import VisualizationQueryRequest
from app.services.query_builder import QueryBuilder

# Celery 프로세스 전용 비동기 DB 엔진 (30초 DB 타임아웃 설정)
engine = create_async_engine(
    settings.DATABASE_URL,
    connect_args={"options": "-c statement_timeout=30000"}
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@shared_task(
	bind=True,
    name="app.worker.tasks.execute_heavy_bi_query",
    time_limit=60, # Hard Limit : 프로세스 강제 종료를 위한 옵션
    soft_time_limit=45, # Soft Limit: Exception 발생 옵션
    max_retries=1
)
def execute_heavy_bi_query(self, spec_dict: dict) -> dict:
	return asyncio.run(_run_async_query(self.request.id, spec_dict))


async def _run_async_query(task_id: str, spec_dict: dict) -> dict:
	try:
        spec = VisualizationQueryRequest.model_validate(spec_dict)

        builder = QueryBuilder(table_name="sales_analytics_view")
        statement = builder.build_query(spec)

        async with AsyncSessionLocal() as session:
            result = await session.execute(statement)
            mappings = result.mappings().all()
            rows = [dict(row) for row in mappings]

        payload = {
            "status": "SUCCESS",
            "total_count": len(rows),
            "rows": rows
        }

        await redis_client.set(f"bi:task:result:{task_id}", json.dumps(payload), ex=3600)
        return payload

    except SoftTimeLimitExceeded:
        error_payload = {
            "status": "FAILURE",
            "error": "Query execution exceeded time limit (Soft Timeout: 45s)."
        }
        await redis_client.set(f"bi:task:result:{task_id}", json.dumps(error_payload), ex=600)
        raise

    except Exception as e:
        error_payload = {
            "status": "FAILURE",
            "error": "An internal error occurred during analytics query execution."
        }
        await redis_client.set(f"bi:task:result:{task_id}", json.dumps(error_payload), ex=600)
        raise e

```

POST /query/async의 요청을 받아 큰 작업을 백그라운드 워크로 넘긴다. 워커는 타임아웃 제한 조건 하에 쿼리를 실행 하고 결과를 Redis에 저장한다.

```python
# app/api/v1/endpoints/analytics.py

...
from app.worker.tasks import execute_heavy_bi_query
from celery.result import AsyncResult
from app.core.redis import redis_client

...

@router.post("/query/async", status_code=status.HTTP_202_ACCEPTED)
async def submit_async_visualization_query(spec: VisualizationQueryRequest):
	task = execute_heavy_bi_query.delay(spec.model_dump())

    return {
    	"task_id" : task.id,
        "status": "PENDING",
        "poll_url": f"/api/v1/analytics/tasks/{task.id}"
    }

...

@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
	cached_result = await redis_client.get(f"bi:task:result:{task_id}")
    if cached_result:
        return json.loads(cached_result)

    task = AsyncResult(task_id)
    if task.state == "PENDING":
        return {"status": "PENDING", "message": "Job queued"}
    elif task.state == "STARTED":
        return {"status": "RUNNING", "message": "Executing database query"}
    elif task.state == "FAILURE":
        return {"status": "FAILURE", "error": str(task.info)}

    return {"status" : task.state}
```

앞서 프론트엔드에서 먼저 배선하였던 `useVisualizationQuery.ts` 훅을 확장하여 Async Custom Hook을 새로 작성할 수도 있다.

```typescript
// hooks/useAsyncVisualizationQuery.ts
import { useQuery } from "@tanstack/react-query";
import type { VisualizationSpec } from "../types/visualization";

interface TaskStatusResponse {
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILURE";
  rows?: Record<string, unknown>[];
  error?: string;
  total_count?: number;
}

export function useAsyncVisualizationQuery(spec: VisualizationSpec) {
  const taskSubmitQuery = useQuery({
    queryKey: ["async-bi-task-id", spec],
    queryFn: async () => {
      const response = await fetch("/api/v1/analytics/query/async", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });

      if (!response.ok) {
        throw new Error("Failed to submit async query task.");
      }

      return response.json() as Promise<{ task_id: string; poll_url: string }>;
    },
    enabled: spec.dimensions.length > 0 && spec.metrics.length > 0,
    staleTime: Infinity,
  });

  const taskId = taskSubmitQuery.data?.task_id;

  const pollQuery = useQuery({
    queryKey: ["async-bi-task-result", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/analytics/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to check task status.");
      }
      return response.json() as Promise<TaskStatusResponse>;
    },
    enabled: !!taskId,
    refetchInterval: (query) => {
      const stateData = query.state.data;
      if (stateData?.status === "SUCCESS" || stateData?.status === "FAILURE") {
        return false;
      }
      return 2000;
    },
  });

  const currentStatus = pollQuery.data?.status;

  return {
    isLoading:
      taskSubmitQuery.isLoading ||
      pollQuery.isLoading ||
      currentStatus === "PENDING" ||
      currentStatus === "RUNNING",
    isError:
      taskSubmitQuery.isError ||
      pollQuery.isError ||
      currentStatus === "FAILURE",
    error:
      taskSubmitQuery.error?.message ||
      pollQuery.error?.message ||
      pollQuery.data?.error,
    data: pollQuery.data?.rows ?? [],
    status: currentStatus ?? "IDLE",
  };
}
```

이제는 `useVisualizationQuery` 훅을 사용한 수초 내 종료되는 경량 집계 쿼리에 대한 단일 HTTP POST 요청 처리 작업과, `useAsyncVisualizationQuery` 훅을 사용하여 수초 이상 소요되는 집계 쿼리에 대해서 작업을 먼저 POST로 생성한 후 특정 주기 (예시 : 2초) 마다 결과를 GET으로 Polling함으로써, Gateway 타임아웃에 대한 제약이 덜한 기능 수행이 가능해진다.

### Serving

컨테이너 패키징 및 의존성 이관과 관련된 내용은 다음 포스트에서 좀 더 자세히 기술하려고 한다.

여기에서는 간단하게 Dockerfile을 통해 최종적인 자원을 추출해 베이스 이미지를 구성하는 단계와,

폐쇄망 Nginx Reverse Proxy / Routing 처리 단계만 간략하게 기술하려고 한다.

A - Multi-Stage Dockerfile
백엔드/프론트엔드 모두 CI 환경 내 완료 후, 최종 결과물을 가지고 베이스 이미지에 탑재시킨다.

```Dockerfile

# --Frontend--
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# -- Nginx + FastAPI Serving --

FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

B - Offline Image Orchestration

Harbor, Nexus 등 내부 레지스트리가 구축되어 있지 않은 환경의 경우엔, docker save를 통해 Tar 형태 파일로 이관한다.

```bash
docker build -t bi-app:1.0.0 .
docker save -o bi-app-1.0.0.tar bi-app:1.0.0 redis:7-alpine postgres:15-alpine

# 폐쇄망 환경 이관 후 이미지 로드
docker load -i bi-app-1.0.0.tar

```

C - Nginx Reverse Proxy / Routing

```nginx
server {
	listen 80;
    server_name localhost;

    # SPA Static Assets
    location / {
    	root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # FastAPI BE API Proxy
    location /api/v1 {
 		proxy_pass http://fastapi-backend:8000/api/v1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;


        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

}

```

### Conclusion

Product Engineer로서 고려해야 할 부분은 결국, 사용자에게 필요한 기능을 정의하는 것에서 출발해, 그 기능이 안정적으로 동작할 수 있도록 데이터와 시스템의 경계를 구체화하는 일이라고 볼 수 있다.

모든 문제를 처음부터 완벽한 아키텍처로 해결할 수는 없는 한계는 당연히 존재할거라고 본다.

실제 구현 과정에서 발견되는 요구사항과 제약을 반영하고, 필요한 수준의 추상화를 선택하며, 설계가 제공하는 이점을 검증하는 과정은 때로는 순차적으로 잘 진행될 수 있으나, 때로는 특정 단계로 회귀해야 하는 변수도 발생하기 마련이다.

이번 경험은 시각화 기술 자체보다 그 기술을 제품의 일부로 만들기 위해 어떤 경계와 계약을 정의해야 하는지 생각해 보는 과정이 되었던거 같다.
