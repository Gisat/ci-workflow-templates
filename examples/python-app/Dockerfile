# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev

COPY . .

ENV PYTHONUNBUFFERED=1

CMD ["python", "app.py"]
