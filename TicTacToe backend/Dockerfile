FROM python:3.10.6

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /backend/

RUN python manage.py migrate

EXPOSE 8000