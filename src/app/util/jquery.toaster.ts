// http://www.jqueryscript.net/other/jQuery-Bootstrap-Based-Toast-Notification-Plugin-toaster.html
// $.toaster({ priority : 'success', title : 'Title', message : 'Your message here'});
declare var jQuery: any;
(function($) {
    var settings: any = {};
    var toasting = {
        gettoaster: function() {
            var toaster = $('#' + settings.toaster.id);

            if (toaster.length < 1) {
                toaster = $(settings.toaster.template)
                    .attr('id', settings.toaster.id)
                    .css(settings.toaster.css)
                    .addClass(settings.toaster['class']);

                if ((settings.stylesheet) && (!$("link[href=" + settings.stylesheet + "]").length)) {
                    $('head').appendTo('<link rel="stylesheet" href="' + settings.stylesheet + '">');
                }

                $(settings.toaster.container).append(toaster);
            }

            return toaster;
        },

        notify: function(title, message, priority) {
            var $toaster = this.gettoaster();
            var $toast = $(settings.toast.template.replace('%priority%', priority))
                .hide()
                .css(settings.toast.css)
                .addClass(settings.toast['class']);

            $('.title', $toast).css(settings.toast.csst).html(title);
            $('.message', $toast).css(settings.toast.cssm).html(message);

            if (settings.debug && window.console) {
                console.log($toast);
            }

            $toaster.append(settings.toast.display($toast));

            if (settings.donotdismiss.indexOf(priority) === -1) {
                var timeout = (typeof settings.timeout === 'number')
                    ? settings.timeout
                    : ((typeof settings.timeout === 'object') && (priority in settings.timeout))
                        ? settings.timeout[priority]
                        : 5000;
                setTimeout(function() {
                    settings.toast.remove($toast, function() {
                        $toast.remove();
                    });
                }, timeout);
            }
        }
    };

    var defaults = {
        toaster: {
            id: 'toaster',
            container: 'body',
            template: '<div></div>',
            class: 'toaster',
            css: {
                'position': 'fixed',
                'top': '10px',
                'right': '10px',
                'width': '300px',
                'zIndex': 50000
            }
        },

        toast: {
            template: `
                <div class="alert alert-%priority%" role="alert">
                    <span class="title"></span><br><span class="message"></span>
                </div>`,

            defaults: {
                'title': 'Notice',
                'priority': 'success'
            },

            css: {},
            cssm: {},
            csst: { 'fontWeight': 'bold' },
            fade: 'slow',

            display: function($toast) {
                return $toast.fadeIn(settings.toast.fade);
            },

            remove: function($toast, callback) {
                return $toast.animate(
                    {
                        opacity: 0
                    },
                    {
                        duration: settings.toast.fade,
                        complete: callback
                    }
                );
            }
        },

        debug: false,
        timeout: 5000,
        stylesheet: null,
        donotdismiss: []
    };

    $.extend(settings, defaults);

    $.toaster = function(options) {
        if (typeof options === 'object') {
            if ('settings' in options) {
                settings = $.extend(true, settings, options.settings);
            }
        } else {
            var values = Array.prototype.slice.call(arguments, 0);
            var labels = ['message', 'title', 'priority'];
            options = {};

            for (var i = 0, l = values.length; i < l; i += 1) {
                options[labels[i]] = values[i];
            }
        }

        var title = (('title' in options) && (typeof options.title === 'string'))
            ? options.title
            : settings.toast.defaults.title;
        var message = ('message' in options) ? options.message : null;
        var priority = (('priority' in options) && (typeof options.priority === 'string'))
            ? options.priority
            : settings.toast.defaults.priority;

        if (message !== null) {
            toasting.notify(title, message, priority);
        }
    };

    $.toaster.reset = function() {
        settings = {};
        $.extend(settings, defaults);
    };

})(jQuery);
