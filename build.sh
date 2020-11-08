#!/bin/bash

npm test &&


DIST_FOLDER=../bitgesell-wallet-js-frontend-core-dist

mkdir -p $DIST_FOLDER &&

cp -r public/* $DIST_FOLDER/ &&

babel \
src/utils.js \
src/app.js \
src/login.js \
src/welcome.js \
src/create-wallet.js \
src/set-password.js \
src/restore.js \
src/my-addresses.js \
src/new-address.js \
src/transactions.js \
src/send.js \
-o $DIST_FOLDER/app.js &&

uglifyjs \
src/lib/1-jquery-3.2.1.min.js \
src/lib/2-jquery.dataTables.min.js \
src/lib/3-dataTables.bootstrap4.min.js \
src/lib/4-dataTables.responsive.min.js \
src/lib/5-responsive.bootstrap.min.js \
src/lib/bootstrap-native-v4.min.js \
src/lib/sweetalert2.min.js \
src/lib/dayjs.min.js \
src/lib/bootstrap-native-v4.min.js \
src/lib/sweetalert2.min.js \
src/lib/dayjs.min.js \
src/lib/qrcode.js \
src/lib/satoshi-bitcoin.js \
$DIST_FOLDER/app.js \
-c drop_console=true,toplevel=true -m toplevel=true -o $DIST_FOLDER/app.min.js &&

rm $DIST_FOLDER/app.js &&

html-minifier --collapse-whitespace --remove-comments \
src/header.html \
src/main.html \
src/my-addresses.html \
src/new-address.html \
src/transactions.html \
src/dashboard.html \
src/send.html \
src/footer.html \
src/welcome.html \
src/create-wallet.html \
src/restore.html \
src/set-password.html \
src/login.html \
-o $DIST_FOLDER/index.html &&

cleancss \
src/lib/bootstrap.min.css \
src/lib/sweetalert2.min.css \
src/lib/animate.min.css \
src/lib/loading.css \
src/lib/dataTables.bootstrap4.min.css \
src/lib/responsive.bootstrap4.min.css \
src/custom.css \
-o $DIST_FOLDER/custom.min.css --skip-rebase
