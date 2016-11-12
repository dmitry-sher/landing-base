# Project name

**TBD** — To-Be-Decided
**WIP** — Work-In-Progress

## 1. Ссылки на ресурсы проекта
 PDF с полным дизайном по адресу **TBD**

 Wireframe JPG 960px@2 **TBD**

 Отдельные файлы страниц в jpeg100/png24 под размер экрана 1440px (с ретиной/без ретины) по адресу *TBD*

 Шрифты в форматах otf, woff, woff2, ttf, eot по адресу *TBD*

 Favicon PNG8/PNG24 512px в git по адресу `design/fav512.png`.

 Мета-теги и ресурсы (картинки) шеринга: в git, мета-теги `source/pages/meta.html`, картинки в `design/social`.

 Статические картинки (для страниц *TBD*) по адресу *TBD*

 Статические фалйы (для страниц *TBD*) по адресу *TBD*

## 2. Краткое описание бизнес-процесса


## 3. Более детальное описание бизнес-процесса


### 3.1 Переходы между страницами

### 3.2 ...Отдельные страницы


## 4. Требования к дизайну

### 4.1. Шрифты, размеры, цвета
Используются следующие шрифты: *TBD*

Fall-back шрифты:
 * Serif: Times
 * Sans-serif: Helvetica, Verdana

Для экрана **1440px** размеры шрифтов:

 * Design-version
 * *TBD*
 * Wireframe-version
  * большой (header) 42px
  * средний (body) 28px
  * малый (meta) 18px

**Цвета:**

 * фирменный голубой цвет #2497fc
 * фирменный красный #fc2424
 * темный цвет шрифта #231f20

### 4.2. Требования к совместимости
Сайт должен безошибочно работать и отображаться в браузерах:

 * IE 9+
 * Firefox 47+ @Mac, @Win,
 * Latest Firefox @Android, @iOS
 * Chrome 49+ @Mac, @Win,
 * Latest Chrome @Android, @iOS
 * Safari 9.1+ @Mac
 * Safari 9+ @iOS
 * Opera 40+ @Mac, @Win
 * Android Browser 4.3+ @Android
 * UC Browser for Android 11+ @Android
 * Samsung Internet 4+ @Android

### 4.3. Мобильные режимы, для экранов < 768px
*TBD*

Дизайн скейлится по ширине экрана.

### 4.4. Для экранов <960px
Дизайн по размеру 960px, скроллится.

### 4.5. Для экранов 961 - 1440px
Файл примера дизайна по адресу *TBD*

Дизайн скейлится по ширине экрана.

### 4.6. Для экранов > 1440px
Дизайн по размеру 1440px, с полями дефолтного голубого цвета.

### 4.7. Экстремальные ресайзы
При ширине экрана >=768px и высоте экрана менее *TBD*px на сайте появляется скролл.

Мобильные режимы отображения включаются только на девайсах, на десктопе при ширине <768px скролл.

### 4.8. Процесс загрузки
Файл дизайна экрана загрузки по адресу *TBD*

До загрузки и инициализации всех ресурсов показываем экран загрузчика. Код загрузчка должен целиком содержться в файле html лендинга и отображение включаться максимально быстро. Загрузчик -- мордочка бота с крутящимися глазами. До его появления экран полностью залит фирменным голубым.

### 4.9. Анимации
*TBD*

### 4.10. Коды счетчиков
GA:
```js

```

### 4.11. Page Events for GA
*TBD*

## 5. Сопряжение с backend


## 6. Legal info

Все права на код принадлежат Don't Panic Inc
На front-end используются следующие фреймворки и библиотеки

 * библиотека, версия, лицензия

На back-end используются следующие фреймворки и библиотеки

 * библиотека, версия, лицензия

## 7. Front-end build

### 7.1. Dependencies
First make sure node/npm is installed on your computer.<br/>
Then install modules in `source`:
```
npm install
```

### 7.2. How to Use
In the `source` of the project, just simply run the gulp script in your terminal:
```
gulp
```
The watcher should start right away and you can get started on editing your stylesheets and stuff. Watched dirs are: `pages`, `scss`, `scripts`, `img`, `fav`, `fonts`.


### 7.3. How to build
In the `source` of the project, just simply run the gulp script in your terminal:
```
gulp build
```
You will find results in `source/dist` folder.

### 7.4. How to Deploy
In the base of the project, find a `source/dist` folder. Serve the contents somewhere.

### 7.5. Send The Form And Files
Connection settings are saved in `sourece/scripts/settings.js`. Rebuild the project after you change settings.
