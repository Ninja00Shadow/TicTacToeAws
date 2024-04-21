FROM python:3.10.6

# stdout and stderr streams are seen in real time
ENV PYTHONUNBUFFERED=1
# stops generating bytecode (.pyc)
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /backend/

RUN python manage.py migrate

EXPOSE 8000

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]