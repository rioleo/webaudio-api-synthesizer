$.socialShare = function(o) {
        var text = o.text || $('head meta[property="og:description"]').attr('content');
        var title = o.title || $('head meta[property="og:title"]').attr('content');
        var url = o.url || $('head meta[property="og:url"]').attr('content');

        $.fn.windowOpen = function(href, name, width, height) {
            $(this).attr('href', href).click(function() {
                window.open(href, name, 'width=' + width + ', height=' + height);
                return false;
            });
        }

        if (o.twitter) $(o.twitter).windowOpen("https://twitter.com/intent/tweet?original_referer=" + document.referrer + '&text=' + text + '&url=' + url, 'twitter', 446, 436);

        if (o.vkontakte) $(o.vkontakte).windowOpen('http://vkontakte.ru/share.php?url=' + url, 'vkontakte', 626, 436);

        if (o.facebook) $(o.facebook).windowOpen('http://www.facebook.com/sharer.php?u=' + url, 'facebook', 830, 650);

        if (o.googleplus) $(o.googleplus).windowOpen('https://plus.google.com/_/+1/confirm?hl=en&url=' + url + '&title=' + title, 'google+', 446, 436);
    }
