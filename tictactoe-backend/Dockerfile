FROM python:3.10-slim

# stdout and stderr streams are seen in real time
ENV PYTHONUNBUFFERED=1
# stops generating bytecode (.pyc)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . /backend/

EXPOSE 8000

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
