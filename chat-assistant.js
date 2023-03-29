(function () {
    window._CHAT_BOT = {
        url: '/api/external/gpt',
        userImageUrl: function () {
            return (window.g_user && window.g_user.imageUrl) || '/static/img/user.png';
        },
        status: 'idle',
        $bot: null
    };

    let completion = async function (content) {
        let resp = await fetch(window._CHAT_BOT.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        });
        return resp.json();
    }

    let do_ask = function () {
        let $ta = window._CHAT_BOT.$bot.find('textarea.x-chat-input');
        let content = $.trim($ta.val());
        console.log(content);
        if (!content) {
            return;
        }
        print_dialog(content, false);
        let $last = print_dialog('(正在思考……)', true);
        $ta.val('');
        window._CHAT_BOT.$ask.attr('disabled', 'disabled');
        let process = function (data) {
            if (data && data.content) {
                return data.content;
            }
            if (data && data.error) {
                if (data.error === 'RATE_LIMIT') {
                    return '你今天问了太多问题了，我不想回答了，明天再来问吧。';
                }
                if (data.error === 'AUTH_SIGNIN_REQUIRED') {
                    return '你先登录确认身份后再提问。';
                }
            }
            return (data && data.message) || '(出错了，让我冷静1分钟)';
        }
        completion(content).then(data => {
            console.log(data);
            $last.remove();
            print_dialog(process(data), true);
        }).catch(err => {
            console.error(err);
            print_dialog(process(err), true);
        }).finally(() => {
            window._CHAT_BOT.$ask.removeAttr('disabled');
        });
    }

    let print_dialog = function (message, isRobot) {
        let $list = $('div.x-chat-history');
        let templ = $list.find(isRobot ? 'div.x-chat-robot' : 'div.x-chat-user').html();
        templ = templ.replace('$CONTENT', marked.parse(message));
        $list.append(templ);
        if (isRobot) {
            let $mouth = window._CHAT_BOT.$bot.find('div.x-robot-assistant-mouth');
            $mouth.show();
            setTimeout(function () {
                $mouth.hide();
            }, 1000);
        }
        $list.animate({ scrollTop: $list.get(0).scrollHeight - $list.get(0).clientHeight }, 1000);
        return $list.find('>div:last-child');
    }

    window._CHAT_BOT.init = function () {
        let html = $('#chatbot-template').html();
        html = html.replace('$IMAGE_URL', window._CHAT_BOT.userImageUrl());
        html = html.replace('$IMAGE_URL', window._CHAT_BOT.userImageUrl());
        $('ins.adsbygoogle[data-anchor-shown=true]').hide();
        $('body').append(html);
        $('#chatbot-template').remove();
        window._CHAT_BOT.$bot = $('div.x-chat-bot');
        window._CHAT_BOT.$bot.find('button.x-chat-end').click(() => { window._CHAT_BOT.$bot.hide() });
        window._CHAT_BOT.$ask = window._CHAT_BOT.$bot.find('button.x-chat-ask');
        window._CHAT_BOT.$ask.click(do_ask);
        print_dialog('你好，我是一名人工智能助教，如果你在学习中遇到问题可以直接问我。', true);
        let $eye = window._CHAT_BOT.$bot.find('div.x-robot-assistant-eyes');
        // blink:
        setInterval(function () {
            $eye.show();
            setTimeout(function () {
                $eye.hide();
            }, 200);
        }, 1000 * parseInt(5 + Math.random() * 5));
    };

    try {
        window._CHAT_BOT_LOADED();
    } catch (err) {
        console.error(err);
    }
})();