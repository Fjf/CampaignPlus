import smtplib
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Optional

import flask

from server import app
from server.lib.database import request_session
from server.lib.model.models import UserModel, EmailResetModel


def add(user: UserModel):
    db = request_session()

    db.add(user)
    db.commit()


def find_user_by_id(user_id: int):
    db = request_session()

    return db.query(UserModel)\
        .filter(UserModel.id == user_id).one_or_none()


def find_user_by_name(user_name: str):
    db = request_session()

    return db.query(UserModel)\
        .filter(UserModel.name == user_name).one_or_none()


def find_user_by_email(email: str) -> Optional[UserModel]:
    db = request_session()

    return db.query(UserModel)\
        .filter(UserModel.email == email).one_or_none()


def send_email(user_model: UserModel, content: str, title: str):
    """
    Generates an email with a link and sends it to the reset requester.

    :param user_model: The user to send the email to.
    :param content: The body of the email to be send.
    :param title: The title of the email.
    """
    email = user_model.email
    msg = MIMEMultipart('alternative')
    msg.attach(MIMEText(content, 'html'))

    msg["From"] = formataddr((str(Header('DnDool', 'utf-8')), app.email_address))
    msg["To"] = email
    msg["Subject"] = title

    host = flask.request.headers['Host']

    try:
        server = smtplib.SMTP_SSL(app.email_server, 465)
        server.ehlo()
        server.login(app.email_address, app.email_password)
        server.sendmail(app.email_address, email, msg.as_string())
        print("Successfully sent email")
    except Exception:
        print('Failed to send mail: ' + title)


def find_reset_with_code(code: str) -> Optional[EmailResetModel]:
    db = request_session()

    return db.query(EmailResetModel) \
        .filter(EmailResetModel.code == code) \
        .one_or_none()
