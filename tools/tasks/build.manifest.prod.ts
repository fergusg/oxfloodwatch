import {APP_DEST} from '../config';

export = function(gulp, plugins) {
    return function() {
        return gulp.src([`${APP_DEST}/**/*`], { base: APP_DEST })
            .pipe(plugins.manifest({
                hash: true,
                preferOnline: true,
                network: ['*'],
                filename: 'app.manifest',
                exclude: 'app.manifest'
            }))
            .pipe(gulp.dest(APP_DEST));
    };
};
