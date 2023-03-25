import axios from 'axios';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_TIMEOUT = 9000;

function buildError(message, type = null, code = null, param = null) {
    return JSON.stringify({
        error: {
            message: message,
            type: type,
            code: code,
            param: param
        }
    });
}

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 400,
            body: buildError('http method not allowed.', 'method_not_allowed')
        };
    }

    let authorization = event.headers['authorization'];
    if (!authorization) {
        return {
            statusCode: 400,
            body: buildError('missing authorization header.', 'invalid_request_error')
        }
    }
    try {
        let resp = await axios({
            method: 'post',
            url: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization
            },
            timeout: API_TIMEOUT,
            data: event.body
        });
        return {
            statusCode: 200,
            body: resp.data
        }
    } catch (err) {
        if (err.response) {
            return {
                statusCode: 400,
                body: err.response.data
            }
        } else {
            return {
                statusCode: 400,
                body: buildError(err.toString(), 'http_request_error')
            }
        }
    }
}