/**
 * LBN 一键分享（全站通用）
 * 用法：在页面 <head> 中引入 <script src="/assets/js/share.js" defer></script>
 * - 页面中已存在 #shareBtn 时，直接绑定该按钮；
 * - 不存在时，自动在右下角注入悬浮分享按钮；
 * - 分享内容自动取自当前页面：og:title / <title>、meta description、当前网址。
 */
(function () {
    if (window.__LBN_SHARE_INITED__) return;
    window.__LBN_SHARE_INITED__ = true;

    var ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="18" cy="5" r="3"></circle>' +
        '<circle cx="6" cy="12" r="3"></circle>' +
        '<circle cx="18" cy="19" r="3"></circle>' +
        '<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>' +
        '<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>' +
        '</svg>';

    /* 当前网址：自动取浏览器地址，去掉 query 与 hash，得到干净的分享链接 */
    function currentUrl() {
        var url = location.href;
        var idx = url.indexOf('#');
        if (idx > -1) url = url.slice(0, idx);
        idx = url.indexOf('?');
        if (idx > -1) url = url.slice(0, idx);
        return url;
    }

    function metaContent(selector) {
        var el = document.querySelector(selector);
        return el ? (el.getAttribute('content') || '').trim() : '';
    }

    function getPageInfo() {
        var title = metaContent('meta[property="og:title"]') ||
            (document.title || '').trim() ||
            'LBN万能网站 - 在线开发者工具集合';
        var desc = metaContent('meta[name="description"]') ||
            metaContent('meta[property="og:description"]');
        return {
            title: title,
            desc: desc,
            url: currentUrl()
        };
    }

    function buildShareText() {
        var info = getPageInfo();
        var lines = [info.title];
        if (info.desc) lines.push(info.desc);
        lines.push(info.url);
        return lines.join('\n');
    }

    /* 兼容旧浏览器 / 非安全上下文的复制方案 */
    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (e) {
            ok = false;
        }
        document.body.removeChild(ta);
        return ok;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(function () {
                return true;
            }, function () {
                return fallbackCopy(text);
            });
        }
        return Promise.resolve(fallbackCopy(text));
    }

    function injectStyles() {
        var style = document.createElement('style');
        style.textContent = [
            '.lbn-share-fab{position:fixed;right:20px;bottom:24px;width:46px;height:46px;border:none;',
            'border-radius:50%;background:#4f46e5;color:#fff;cursor:pointer;display:flex;',
            'align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(79,70,229,.35);',
            'z-index:3000;transition:transform .15s ease,background .2s ease,box-shadow .2s ease;}',
            '.lbn-share-fab:hover{background:#4338ca;transform:translateY(-2px);',
            'box-shadow:0 10px 22px rgba(79,70,229,.4);}',
            '.lbn-share-fab:active{transform:translateY(0) scale(.94);}',
            '.lbn-share-fab svg{width:20px;height:20px;pointer-events:none;}',
            '.lbn-share-toast{position:fixed;left:50%;bottom:84px;transform:translate(-50%,12px);',
            'background:#1f2937;color:#fff;font-size:13.5px;line-height:1.5;padding:10px 18px;',
            'border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,.2);opacity:0;pointer-events:none;',
            'transition:opacity .25s ease,transform .25s ease;z-index:3001;max-width:calc(100vw - 40px);',
            'text-align:center;}',
            '.lbn-share-toast.show{opacity:1;transform:translate(-50%,0);}',
            '@media (prefers-reduced-motion: reduce){.lbn-share-fab,.lbn-share-toast{transition:none;}}'
        ].join('');
        document.head.appendChild(style);
    }

    function createFab() {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'lbnShareFab';
        btn.className = 'lbn-share-fab';
        btn.title = '一键分享本页';
        btn.setAttribute('aria-label', '一键分享本页');
        btn.innerHTML = ICON_SVG;
        document.body.appendChild(btn);
        return btn;
    }

    function createToast() {
        var el = document.createElement('div');
        el.className = 'lbn-share-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
        return el;
    }

    var toastTimer = null;

    function toast(msg) {
        var el = document.querySelector('.lbn-share-toast') || createToast();
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove('show');
        }, 2200);
    }

    function bind(btn) {
        btn.addEventListener('click', function () {
            var text = buildShareText();
            copyText(text).then(function (ok) {
                if (ok) {
                    toast('已复制本页信息与链接，快去分享吧～');
                } else {
                    toast('复制失败，请手动复制：' + getPageInfo().url);
                }
            });
        });
    }

    function init() {
        injectStyles();
        var btn = document.getElementById('shareBtn');
        if (!btn) {
            btn = createFab();
        }
        bind(btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
