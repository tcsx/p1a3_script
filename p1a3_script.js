// ==UserScript==
// @name         1p3a_script

// @version      0.1.3

// @author       Liumeo
// @match        https://www.1point3acres.com/bbs/*

// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/eagleoflqj/p1a3_script/master/QA.js

// ==/UserScript==

(function () {
    'use strict';



    // 针对不同页面的操作
    const url = window.location.href;
    if (url.startsWith('https://www.1point3acres.com/bbs/')) {
        const jq = jQuery.noConflict();
        const waitUntilElementLoaded = function (element, retryTimes = 20) { // 异步等待元素出现并返回
            return new Promise((resolve, reject) => {
                const check = (ttl) => {
                    const e = jq(element);
                    if (!e.length && ttl) { // 未加载且未超时
                        setTimeout(check, 1000, ttl - 1);
                    } else {
                        resolve(e); // 已加载或超时，返回jQuery对象
                    }
                };
                check(retryTimes);
            });
        };
        // 自动签到
        const sign = jq('.wp a:contains("签到领奖")')[0];
        sign && sign.onclick && (sign.onclick() || 1) &&
            (async () => { // 点击签到领奖
                const qiandao = await waitUntilElementLoaded('#qiandao');
                if (!qiandao.length) {
                    return;
                }
                const faces = qiandao.find('.qdsmilea>li'); // 所有表情
                const selected_face = faces[Math.floor(Math.random() * faces.length)]; // 随机选择表情
                selected_face.onclick();
                const todaysay = qiandao.find('#todaysay'); // 文字框
                todaysay.val('今天把论坛帖子介绍给好基友了~'); // 快速签到的第一句
                const button = qiandao.find('button')[0];
                button.onclick();
            })(); // 保证签到对话框加载
        // 签到后自动答题
        const dayquestion = jq('#um img[src*=ahome_dayquestion]').parent()[0];
        !sign && dayquestion && dayquestion.onclick && (dayquestion.onclick() || 1) &&
            (async () => {
                const fwin_pop = await waitUntilElementLoaded('#fwin_pop form');
                const question = fwin_pop.find('font:contains(【题目】)').text().slice(5).trim();
                const prompt = '尚未收录此题答案。如果您知道答案，请将\n"\n' + question + '\n{您的答案}\n"\n以issue形式提交至https://github.com/eagleoflqj/p1a3_script/issues';
                const answer = QA[question] || QA[question + "?"];
                if (!answer) { // 题库不含此题
                    console.log(prompt);
                    return;
                }
                // 自动回答
                const option_list = [];
                const answer_list = typeof answer === 'string' ? [answer] : answer;
                // 答案和选项取交集
                fwin_pop.find('.qs_option').toArray()
                    .forEach(option => answer_list
                        .filter(answer => option.textContent.trim() === answer)
                        .forEach(() => option_list.push(option)));
                if (!option_list.length) {
                    console.log(prompt);
                    return;
                }
                if (option_list.length > 1) {
                    alert('[Warning] 多个选项与题库答案匹配');
                    return;
                }
                option_list[0].onclick();
                jq('#um > p:nth-child(4) > a:nth-child(1)').click();
                jq('#seccodeverify_SA00')[0].focus();
                
                // const button = fwin_pop.find('button')[0];
                // button.click(); // 提交答案
                // console.log(question + '\n答案为：' + answer);
            })(); // 保证答题对话框加载
    }

})();
