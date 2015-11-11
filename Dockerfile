FROM node:latest

ADD ./files/setup.sh /support/setup.sh
ADD ./files/start.sh /support/start.sh
ADD ./requirements.txt /support/requirements.txt

RUN ["sh", "/support/setup.sh"]
