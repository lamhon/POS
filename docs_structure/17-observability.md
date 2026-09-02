# Observability

## Logging
Serilog structured logging.

Mỗi request nên có:
- timestamp.
- level.
- service.
- environment.
- request/correlation ID.
- route.
- duration.
- status code.

Không log:
- passwords.
- tokens.
- full sensitive personnel data.
- financial secrets.

## Metrics
Theo dõi:
- request count.
- latency.
- error rate.
- DB latency.
- job success/failure.
- cache hit/miss.
- AI latency/cost nếu có.

## Tracing
OpenTelemetry cho distributed tracing khi có nhiều external services.

## Alerts
Alert cho:
- high error rate.
- database unavailable.
- background jobs repeatedly failing.
- storage failures.
- unusual latency.
