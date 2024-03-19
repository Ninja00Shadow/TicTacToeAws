FROM python:3.10.6

ENV PYTHONUNBUFFERED=1 #stdout and stderr streams are seen in real time
ENV PYTHONDONTWRITEBYTECODE=1 #stops generating bytecode (.pyc)

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /backend/

RUN python manage.py migrate

EXPOSE 8000