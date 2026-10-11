# Блоки Robbo Scratch 3 (автоматически извлечены из программы)

Формат записи: `opcode` — «надпись в Robbo Scratch», затем поля. Как использовать — см. FORMAT.md.

## Робот [robot]
- robot_motors_on_for_seconds — «Моторы вкл на [SECONDS] секунд» (команда)
    SECONDS: число (по умолч. "1")
- robot_motors_on — «Моторы вкл» (команда)
- robot_motors_off — «Моторы выкл» (команда)
- robot_set_direction_to — «Уст направление робота [ROBOT_DIRECTION]» (команда)
    ROBOT_DIRECTION: "direction_forward"=Вперёд | "direction_backward"=Назад | "direction_left"=Налево | "direction_right"=Направо (или блок)
- robot_motors_on_for_steps — «Моторы вкл на [STEPS] шагов» (команда) ⚠ отсутствует у робота ScratchDuino (есть только у Robbo)
    STEPS: число (по умолч. "1")
- robot_reset_trip_meters — «Обнулить счётчик шагов» (команда) ⚠ отсутствует у робота ScratchDuino (есть только у Robbo)
- robot_turnright — «Повернуть на ↻ на [DEGREES] градусов» (команда) ⚠ отсутствует у робота ScratchDuino (есть только у Robbo)
    DEGREES: число (по умолч. "15")
- robot_turnleft — «Повернуть ↺ на [DEGREES] градусов» (команда) ⚠ отсутствует у робота ScratchDuino (есть только у Robbo)
    DEGREES: число (по умолч. "15")
- robot_set_motors_power — «Уст мощность моторов [POWER] %» (команда)
    POWER: число (по умолч. "30")
- robot_set_motors_power_left_right_separately — «Уст мощность моторов Л [POWER_LEFT] П [POWER_RIGHT] %» (команда)
    POWER_LEFT: число (по умолч. "30")
    POWER_RIGHT: число (по умолч. "30")
- robot_set_motors_left_right_power_and_direction_separately — «Л [ROBOT_LEFT_MOTOR_DIRECTION] П [ROBOT_RIGHT_MOTOR_DIRECTION] уст мощность Л [POWER_LEFT] П [POWER_RIGHT] %» (команда)
    ROBOT_LEFT_MOTOR_DIRECTION: "direction_forward"=Вперёд | "direction_backward"=Назад (или блок)
    ROBOT_RIGHT_MOTOR_DIRECTION: "direction_forward"=Вперёд | "direction_backward"=Назад (или блок)
    POWER_LEFT: число (по умолч. "30")
    POWER_RIGHT: число (по умолч. "30")
- robot_get_sensor_data — «Робот [ROBOT_SENSORS]» (значение (круглое))
    ROBOT_SENSORS: "sensor1"=Датчик1 | "sensor2"=Датчик2 | "sensor3"=Датчик3 | "sensor4"=Датчик4 | "sensor5"=Датчик5 | "sensor_trip_meter_left"=Счётчик шагов Л | "sensor_trip_meter_right"=Счётчик шагов П (или блок)
- robot_get_rgb_sensor_data — «Датчик цвета RGB [ROBOT_SENSORS_FOR_RGB] [RGB_VALUES]» (значение (круглое)) ⚠ виден только если в Robbo Scratch включён «Набор расширений» (Extension pack) робота
    ROBOT_SENSORS_FOR_RGB: "sensor1"=Датчик1 | "sensor2"=Датчик2 | "sensor3"=Датчик3 | "sensor4"=Датчик4 | "sensor5"=Датчик5 (или блок)
    RGB_VALUES: "red"=Красный | "green"=Зелёный | "blue"=Синий (или блок)
- robot_is_current_color — «Датчик цвета [ROBOT_SENSORS_FOR_RGB] [COLORS]» (условие (шестиугольное)) ⚠ виден только если в Robbo Scratch включён «Набор расширений» (Extension pack) робота
    ROBOT_SENSORS_FOR_RGB: "sensor1"=Датчик1 | "sensor2"=Датчик2 | "sensor3"=Датчик3 | "sensor4"=Датчик4 | "sensor5"=Датчик5 (или блок)
    COLORS: "red"=красный | "magenta"=мажента | "yellow"=жёлтый | "green"=зелёный | "blue"=синий | "cyan"=циан | "black"=чёрный | "gray"=серый | "white"=белый | "unknown"=неизвестный (или блок)
- robot_start_button_pressed — «Кнопка start на Роботе нажата?» (условие (шестиугольное))
- robot_turn_led_on — «Вкл светодиод на роботе [ROBOT_POSITION]» (команда)
    ROBOT_POSITION: "position1"=Позиция1 | "position2"=Позиция2 | "position3"=Позиция3 | "position4"=Позиция4 | "position5"=Позиция5 (или блок)
- robot_turn_led_off — «Выкл светодиод на роботе [ROBOT_POSITION]» (команда)
    ROBOT_POSITION: "position1"=Позиция1 | "position2"=Позиция2 | "position3"=Позиция3 | "position4"=Позиция4 | "position5"=Позиция5 (или блок)
- robot_claw_closed — «Клешня закрыта на [CLAW_CLOSED_PERCENT] %» (команда) ⚠ виден только если в Robbo Scratch включён «Набор расширений» (Extension pack) робота
    CLAW_CLOSED_PERCENT: число (по умолч. "15")
- robot_claw_state — «Клешня [CLAW_STATES]» (команда) ⚠ виден только если в Robbo Scratch включён «Набор расширений» (Extension pack) робота
    CLAW_STATES: "claw_open"=Открыта | "claw_half_open"=Полуоткрыта | "claw_closed"=Закрыта (или блок)

## Лаборатория [laboratory]
- lab_led_turn_on — «Вкл светодиод на Лаборатории [LED_NUMS]» (команда)
    LED_NUMS: "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 (или блок)
- lab_led_turn_off — «Выкл светодиод на Лаборатории [LED_NUMS]» (команда)
    LED_NUMS: "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 (или блок)
- lab_color_led_turn_on — «Вкл цветной светодиод на Лаборатории [LED_COLORS]» (команда)
    LED_COLORS: "red"=красный | "yellow"=жёлтый | "green"=зелёный (или блок)
- lab_color_led_turn_off — «Выкл цветной светодиод на Лаборатории [LED_COLORS]» (команда)
    LED_COLORS: "red"=красный | "yellow"=жёлтый | "green"=зелёный (или блок)
- lab_play_note — «Играть ноту на Лаборатории [LAB_NOTE]» (команда)
    LAB_NOTE: число (по умолч. "48")
- lab_sensor — «Лаборатория [LAB_SENSOR]» (значение (круглое))
    LAB_SENSOR: "light"=свет | "sound"=звук | "slider"=рычажок (или блок)
- lab_button_pressed — «Кнопка на Лаборатории [BUTTON_NUMBER] нажата?» (условие (шестиугольное))
    BUTTON_NUMBER: "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 (или блок)
- lab_external_sensor — «Лаборатория вход [LAB_EXTERNAL_SENSOR]» (значение (круглое)) ⚠ виден только если включены внешние датчики Лаборатории
    LAB_EXTERNAL_SENSOR: "A0"=A0 | "A1"=A1 (или блок)
- lab_analog_pin — «Лаборатория вход [LAB_ANALOG_PIN]» (значение (круглое))
    LAB_ANALOG_PIN: "A0"=A0 | "A1"=A1 | "A2"=A2 | "A3"=A3 | "A4"=A4 | "A5"=A5 (или блок)
- lab_digital_pin — «Лаборатория вход [LAB_DIGITAL_PIN]» (условие (шестиугольное))
    LAB_DIGITAL_PIN: "D8"=D8 | "D9"=D9 | "D10"=D10 | "D11"=D11 | "D12"=D12 | "D13"=D13 (или блок)
- lab_digital_pin_set_on_off — «Уст выход Лаборатории [LAB_DIGITAL_PIN] [LAB_DIGITAL_PIN_STATE]» (команда)
    LAB_DIGITAL_PIN: "D2"=D2 | "D3"=D3 | "D4"=D4 | "D5"=D5 | "D6"=D6 | "D7"=D7 (или блок)
    LAB_DIGITAL_PIN_STATE: "on"=включить | "off"=выключить (или блок)
- lab_digital_pin_set_pwm_value — «Уст выход Лаборатории [LAB_DIGITAL_PIN] в ШИМ значение [PWM_VALUE]» (команда)
    LAB_DIGITAL_PIN: "D2"=D2 | "D3"=D3 | "D4"=D4 | "D5"=D5 | "D6"=D6 | "D7"=D7 (или блок)
    PWM_VALUE: число (по умолч. "0")

## Квадрокоптер [quadcopter]
- copter_fly_up — «Взлёт» (команда)
- copter_land — «Посадка» (команда)
- copter_stop — «СТОП!» (команда)
- copter_status — «Статус» (значение (круглое))
- copter_fly_distance — «Лететь [METERS] метров» (команда)
    METERS: число (по умолч. "0.4")
- copter_fly_time — «Лететь [SECONDS] секунд» (команда)
    SECONDS: число (по умолч. "1")
- copter_change_x_by — «Изменить координату по x на [DISTANCE_DELTA] метров» (команда)
    DISTANCE_DELTA: число (по умолч. "0.1")
- copter_change_y_by — «Изменить координату по у на [DISTANCE_DELTA] метров» (команда)
    DISTANCE_DELTA: число (по умолч. "0.1")
- copter_change_z_by — «Изменить координату по z на [DISTANCE_DELTA] метров» (команда)
    DISTANCE_DELTA: число (по умолч. "0.1")
- copter_x_coord — «Координата по x (метры)» (значение (круглое))
- copter_y_coord — «Координата по y (метры)» (значение (круглое))
- copter_z_coord — «Высота (метры)» (значение (круглое))
- copter_yaw — «Угол поворота (градусы)» (значение (круглое))
- copter_fly_to_coords — «Лететь к x: [X_COORD] y: [Y_COORD] z: [Z_COORD] (метры)» (команда)
    X_COORD: число (по умолч. "0")
    Y_COORD: число (по умолч. "0")
    Z_COORD: число (по умолч. "0")
- copter_rotate — «Повернуть на [DEGREES] градусов» (команда)
    DEGREES: число (по умолч. "45")
- copter_set_direction — «Установить направление [DIRECTION]» (команда)
    DIRECTION: "direction_forward"=Вперёд | "direction_backward"=Назад | "direction_left"=Налево | "direction_right"=Направо (или блок)
- copter_direction — «Направление» (значение (круглое))

## Танцующий робот (Otto) [otto]
- otto_move_servo — «Танцующий робот повернуть [OTTO_SERVO] серво в [SERVO_DIST] позицию [SERVO_SPEED]» (команда)
    OTTO_SERVO: "0"=Левая нога | "1"=Правая нога | "2"=Левая стопа | "3"=Правая стопа | "4"=Левая рука | "5"=Правая рука (или блок)
    SERVO_DIST: число (по умолч. "90")
    SERVO_SPEED: "5"=очень медленно | "3"=медленно | "2"=нормально | "1"=быстро | "0"=очень быстро (или блок)
- otto_move_servo_foot — «Установить ЛН:[OTTO_LL]ПН:[OTTO_RL]ЛС:[OTTO_LF]ПС[OTTO_RF] в позицию [SERVO_SPEED]» (команда)
    OTTO_LL: число (по умолч. "90")
    OTTO_RL: число (по умолч. "90")
    OTTO_LF: число (по умолч. "90")
    OTTO_RF: число (по умолч. "90")
    SERVO_SPEED: "5"=очень медленно | "3"=медленно | "2"=нормально | "1"=быстро | "0"=очень быстро (или блок)
- otto_move_servo_hand — «Установить ЛР:[OTTO_LH] ПР:[OTTO_RH] в позицию [SERVO_SPEED]» (команда)
    OTTO_LH: число (по умолч. "90")
    OTTO_RH: число (по умолч. "90")
    SERVO_SPEED: "5"=очень медленно | "3"=медленно | "2"=нормально | "1"=быстро | "0"=очень быстро (или блок)
- otto_play_sound — «Сыграть ноту [NOTE_TYPE] [NOTE_DURA] секунды» (команда)
    NOTE_TYPE: значение
    NOTE_DURA: "1"=1/8 | "2"=1/4 | "3"=3/8 | "4"=1/2 | "5"=5/8 | "6"=3/4 | "7"=7/8 | "8"=1 (или блок)
- otto_matrix_pix — «Установить пиксель матрицы [MATRIX_STROK] [MATRIX_STOLB] [ON_OFF]» (команда)
    MATRIX_STROK: "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 (или блок)
    MATRIX_STOLB: "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 (или блок)
    ON_OFF: "1"=включить | "0"=выключить (или блок)
- otto_matrix_all_pix — «Отобразить [MATRIX]» (команда)
    MATRIX: значение
- otto_text — «Отобразить текст [OTTO_TEXT] [TEXT_SPEED]» (команда)
    OTTO_TEXT: текст/число (по умолч. "Привет!")
    TEXT_SPEED: "15"=очень медленно | "10"=медленно | "7"=нормально | "5"=быстро | "3"=очень быстро (или блок)
- otto_led — «Нос R:[ON_OFF_R] G:[ON_OFF_G] B:[ON_OFF_B]» (команда)
    ON_OFF_R: число (по умолч. "255")
    ON_OFF_G: число (по умолч. "255")
    ON_OFF_B: число (по умолч. "255")
- otto_hearing — «Звук» (значение (круглое))
- otto_distance — «Расстояние» (значение (круглое))

## Arduino [newcat]
- newcat_set_dig — «Установить цифровой пин [PIN] на выход [HIGH_LOW]» (команда)
    PIN: число (по умолч. "6")
    HIGH_LOW: "1"=HIGH | "0"=LOW (или блок)
- newcat_set_ana — «Установить аналог пин [PWM_PINS] на выход [NUM]» (команда)
    PWM_PINS: "3"=3 | "5"=5 | "6"=6 | "9"=9 | "10"=10 | "11"=11 (или блок)
    NUM: число (по умолч. "0")
- newcat_set_pult — «Установить пин [NUM] для пульта» (команда)
    NUM: число (по умолч. "0")
- newcat_set_hum — «Установть влажность [NUM] пин, тепмература [NUM2] пин» (команда)
    NUM: число (по умолч. "0")
    NUM2: число (по умолч. "0")
- newcat_play_sound — «Играть ноту на [PIN] пине, нота [NOTE_TYPE] длительность [NOTE_DURA]» (команда)
    PIN: число (по умолч. "0")
    NOTE_TYPE: значение
    NOTE_DURA: "1"=1/8 | "2"=1/4 | "3"=3/8 | "4"=1/2 | "5"=5/8 | "6"=3/4 | "7"=7/8 | "8"=1 (или блок)
- newcat_servo — «Установить сервомотор на [PIN] пине на угол [ANGLE]» (команда)
    PIN: число (по умолч. "0")
    ANGLE: угол (по умолч. "0")
- newcat_go_dig — «Сделать пин [PIN] цифровым» (команда)
    PIN: число (по умолч. "0")
- newcat_go_anal — «Сделать пин [PIN_ANAL] аналоговым» (команда)
    PIN_ANAL: "14"=a0 | "15"=a1 | "16"=a2 | "17"=a3 | "18"=a4 | "19"=a5 (или блок)
- newcat_go_sonic — «Установить пины [SOSONIC] echo [PIN2] trig для ультрасоника» (команда)
    SOSONIC: "2"=2 | "3"=3 (или блок)
    PIN2: число (по умолч. "0")
- newcat_read_dig — «Считать цифровой пин [PIN]» (условие (шестиугольное))
    PIN: число (по умолч. "0")
- newcat_read_ana — «Считать значение с [PIN] пина» (значение (круглое))
    PIN: "14"=a0 | "15"=a1 | "16"=a2 | "17"=a3 | "18"=a4 | "19"=a5 (или блок)
- newcat_set_kursor — «Установить курсор в [NUM] [STOLB]» (команда)
    NUM: число (по умолч. "0")
    STOLB: "0"=0 | "1"=1 (или блок)
- newcat_set_text — «Установить текст [MESSAGE]» (команда)
    MESSAGE: текст/число (по умолч. "Привет!")
- newcat_init_lcd — «Инициализировать или очистить дисплей» (команда)

## IoT [iotblocks]
- iot_trigger_on_topic — «триггер [TNAME] топика» (условие (шестиугольное))
    TNAME: текст/число
- iot_parse_data — «получить значения датчиков из [TNAME] топика» (команда)
    TNAME: текст/число
- iot_broker_init — «Установить протокол [BPROTCOL] адрес [BADDR] и порт брокера [BPORT]» (команда)
    BPROTCOL: текст/число
    BADDR: текст/число
    BPORT: число
- iot_set_prefix — «Установить префикс для топика [PREFIX]» (команда)
    PREFIX: текст/число
- iot_mess_to_topic — «Имя топика: [TNAME]; Сообщение: [MESSAGE]» (команда)
    TNAME: текст/число
    MESSAGE: текст/число
- iot_subscribe_to_topic — «Подписаться на [TNAME] топик» (команда)
    TNAME: текст/число
- iot_receive_message — «Последнее сообщение из [TNAME] топика» (значение (круглое))
    TNAME: текст/число
- iot_set_logpass — «Логин: [UNAME]; Пароль: [PASS]» (команда)
    UNAME: текст/число
    PASS: текст/число
- iot_set_wifi — «Установить Wi-Fi SSID: [SSID] Пароль: [PASS]» (команда)
    SSID: текст/число
    PASS: текст/число
- iot_set_client_id — «Установить id клиента: [ID]» (команда)
    ID: текст/число
- iot_set_delay_for_topic — «Период получения значения [DELAY] для [TNAME] топика» (команда)
    DELAY: число
    TNAME: текст/число
- iot_event_more — «Когда топик [TNAME] выше порогового значения» (шапка (старт скрипта))
    TNAME: "air"=air quality | "dis"=distance | "tem"=temperature | "hum"=humidity | "lux"=lux | "wind"=wind | "snd"=sound | "txt"=text | "txt2"=text2 (или блок)
- iot_event_less — «Когда топик [TNAME] ниже порогового значения» (шапка (старт скрипта))
    TNAME: "air"=air quality | "dis"=distance | "tem"=temperature | "hum"=humidity | "lux"=lux | "wind"=wind | "snd"=sound | "txt"=text | "txt2"=text2 (или блок)
- iot_set_under_treshold — «Установить нижнюю границу [TRESH] для топика [TNAME]» (команда)
    TRESH: число
    TNAME: "air"=air quality | "dis"=distance | "tem"=temperature | "hum"=humidity | "lux"=lux | "wind"=wind | "snd"=sound | "txt"=text | "txt2"=text2 (или блок)
- iot_set_upper_treshold — «Установить верхнюю границу [TRESH] для топика [TNAME]» (команда)
    TRESH: число
    TNAME: "air"=air quality | "dis"=distance | "tem"=temperature | "hum"=humidity | "lux"=lux | "wind"=wind | "snd"=sound | "txt"=text | "txt2"=text2 (или блок)
- iot_set_both_treshold — «Установить нижнюю [TRESH] и верхнюю [TRESH2] границы для топика [TNAME]» (команда)
    TRESH: число
    TRESH2: число
    TNAME: "air"=air quality | "dis"=distance | "tem"=temperature | "hum"=humidity | "lux"=lux | "wind"=wind | "snd"=sound | "txt"=text | "txt2"=text2 (или блок)
- iot_connection_status — «Статус подключения» (значение (круглое))
- iot_connection_log — «Лог подключения» (значение (круглое))
- iot_set_delay_for_publish — «Установить задержку [DELAY] для отправки значения в топик [TNAME]» (команда)
    DELAY: число
    TNAME: текст/число

## Движение [motion]
- motion_movesteps — «идти [STEPS] шагов» (команда)
    STEPS: число (по умолч. "10")
- motion_turnright — «повернуть ↻ на [DEGREES] градусов» (команда)
    DEGREES: число (по умолч. "15")
- motion_turnleft — «повернуть ↺ на [DEGREES] градусов» (команда)
    DEGREES: число (по умолч. "15")
- motion_goto — «перейти на [TO]» (команда)
    TO: имя/значение ("_mouse_"=указатель мыши, "_random_"=случайное положение, или имя спрайта/костюма/звука) (или блок)
- motion_gotoxy — «перейти в x: [X] y: [Y]» (команда)
    X: число (по умолч. "0")
    Y: число (по умолч. "0")
- motion_glideto — «плыть [SECS] секунд к [TO]» (команда)
    SECS: число (по умолч. "1")
    TO: имя/значение ("_mouse_"=указатель мыши, "_random_"=случайное положение, или имя спрайта/костюма/звука) (или блок)
- motion_glidesecstoxy — «плыть [SECS] секунд в точку x: [X] y: [Y]» (команда)
    SECS: число (по умолч. "1")
    X: число (по умолч. "0")
    Y: число (по умолч. "0")
- motion_pointindirection — «повернуться в направлении [DIRECTION]» (команда)
    DIRECTION: угол (по умолч. "90")
- motion_pointtowards — «повернуться к [TOWARDS]» (команда)
    TOWARDS: имя/значение ("_mouse_"=указатель мыши, "_random_"=случайно направление, или имя спрайта/костюма/звука) (или блок)
- motion_changexby — «изменить x на [DX]» (команда)
    DX: число (по умолч. "10")
- motion_setx — «установить x в [X]» (команда)
    X: число (по умолч. "0")
- motion_changeyby — «изменить y на [DY]» (команда)
    DY: число (по умолч. "10")
- motion_sety — «установить y в [Y]» (команда)
    Y: число (по умолч. "0")
- motion_ifonedgebounce — «если касается края, оттолкнуться» (команда)
- motion_setrotationstyle — «установить способ вращения [STYLE]» (команда)
    STYLE: "left-right"=влево-вправо | "don't rotate"=не вращать | "all around"=кругом
- motion_xposition — «положение x» (значение (круглое))
- motion_yposition — «положение y» (значение (круглое))
- motion_direction — «направление» (значение (круглое))

## Внешний вид [looks]
- looks_sayforsecs — «говорить [MESSAGE] [SECS] секунд» (команда)
    MESSAGE: текст/число (по умолч. "Привет!")
    SECS: число (по умолч. "2")
- looks_say — «сказать [MESSAGE]» (команда)
    MESSAGE: текст/число (по умолч. "Привет!")
- looks_thinkforsecs — «думать [MESSAGE] [SECS] секунд» (команда)
    MESSAGE: текст/число (по умолч. "Хмм...")
    SECS: число (по умолч. "2")
- looks_think — «думать [MESSAGE]» (команда)
    MESSAGE: текст/число (по умолч. "Хмм...")
- looks_switchbackdropto — «переключить фон на [BACKDROP]» (команда)
    BACKDROP: имя/значение ("BACKDROP1"=backdrop1, или имя спрайта/костюма/звука) (или блок)
- looks_switchbackdroptoandwait — «переключить фон на [BACKDROP] и ждать» (команда)
    BACKDROP: имя/значение ("BACKDROP1"=backdrop1, или имя спрайта/костюма/звука) (или блок)
- looks_nextbackdrop — «следующий фон» (команда)
- looks_switchcostumeto — «изменить костюм на [COSTUME]» (команда)
    COSTUME: имя/значение ("COSTUME1"=costume1, "COSTUME2"=costume2, или имя спрайта/костюма/звука) (или блок)
- looks_nextcostume — «следующий костюм» (команда)
- looks_changesizeby — «изменить размер на [CHANGE] %» (команда)
    CHANGE: число (по умолч. "10")
- looks_setsizeto — «установить размер [SIZE] %» (команда)
    SIZE: число (по умолч. "100")
- looks_changeeffectby — «изменить эффект [EFFECT] на [CHANGE]» (команда)
    EFFECT: "COLOR"=цвет | "FISHEYE"=рыбий глаз | "WHIRL"=завихрение | "PIXELATE"=укрупнение пикселей | "MOSAIC"=мозаика | "BRIGHTNESS"=яркость | "GHOST"=прозрачность
    CHANGE: число (по умолч. "25")
- looks_seteffectto — «установить эффект [EFFECT] [VALUE]» (команда)
    EFFECT: "COLOR"=цвет | "FISHEYE"=рыбий глаз | "WHIRL"=завихрение | "PIXELATE"=укрупнение пикселей | "MOSAIC"=мозаика | "BRIGHTNESS"=яркость | "GHOST"=прозрачность
    VALUE: число (по умолч. "0")
- looks_cleargraphiceffects — «убрать графические эффекты» (команда)
- looks_show — «показаться» (команда)
- looks_hide — «спрятаться» (команда)
- looks_gotofrontback — «перейти на [FRONT_BACK] слой» (команда)
    FRONT_BACK: "front"=передний | "back"=задний
- looks_goforwardbackwardlayers — «перейти [FORWARD_BACKWARD] на [NUM] слоя» (команда)
    FORWARD_BACKWARD: "forward"=вперёд | "backward"=назад
    NUM: целое (по умолч. "1")
- looks_backdropnumbername — «фон [NUMBER_NAME]» (значение (круглое))
    NUMBER_NAME: "number"=номер | "name"=имя
- looks_costumenumbername — «костюм [NUMBER_NAME]» (значение (круглое))
    NUMBER_NAME: "number"=номер | "name"=имя
- looks_size — «размер» (значение (круглое))

## Звук [sound]
- sound_playuntildone — «играть звук [SOUND_MENU] до конца» (команда)
    SOUND_MENU: имя/значение ("0"=1, "1"=2, "2"=3, "3"=4, "4"=5, "5"=6, "6"=7, "7"=8, "8"=9, "9"=10, или имя спрайта/костюма/звука) (или блок)
- sound_play — «включить звук [SOUND_MENU]» (команда)
    SOUND_MENU: имя/значение ("0"=1, "1"=2, "2"=3, "3"=4, "4"=5, "5"=6, "6"=7, "7"=8, "8"=9, "9"=10, или имя спрайта/костюма/звука) (или блок)
- sound_stopallsounds — «остановить все звуки» (команда)
- sound_changeeffectby — «изменить [EFFECT] эффект на [VALUE]» (команда)
    EFFECT: "PITCH"=питч | "PAN"=положение слева/справа
    VALUE: число (по умолч. "10")
- sound_seteffectto — «установить эффект [EFFECT] в [VALUE]» (команда)
    EFFECT: "PITCH"=питч | "PAN"=положение слева/справа
    VALUE: число (по умолч. "100")
- sound_cleareffects — «убрать звуковые эффекты» (команда)
- sound_changevolumeby — «изменить громкость на [VOLUME]» (команда)
    VOLUME: число (по умолч. "-10")
- sound_setvolumeto — «установить громкость [VOLUME]%» (команда)
    VOLUME: число (по умолч. "100")
- sound_volume — «громкость звука» (значение (круглое))

## События [events]
- event_whenflagclicked — «когда ⚑ нажат» (шапка (старт скрипта))
- event_whenkeypressed — «когда клавиша [KEY_OPTION] нажата» (шапка (старт скрипта))
    KEY_OPTION: "space"=пробел | "up arrow"=стрелка вверх | "down arrow"=стрелка вниз | "right arrow"=стрелка вправо | "left arrow"=стрелка влево | "any"=любая | "a"=a | "b"=b | "c"=c | "d"=d | "e"=e | "f"=f | "g"=g | "h"=h | "i"=i | "j"=j | "k"=k | "l"=l | "m"=m | "n"=n | "o"=o | "p"=p | "q"=q | "r"=r | "s"=s | "t"=t | "u"=u | "v"=v | "w"=w | "x"=x | "y"=y | "z"=z | "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 | "8"=8 | "9"=9
- event_whenstageclicked — «когда кликнут по сцене» (шапка (старт скрипта))
- event_whenthisspriteclicked — «когда спрайт нажат» (шапка (старт скрипта))
- event_whenbackdropswitchesto — «когда фон сменился на [BACKDROP]» (шапка (старт скрипта))
    BACKDROP: "BACKDROP1"=backdrop1
- event_whengreaterthan — «когда [WHENGREATERTHANMENU] > [VALUE]» (шапка (старт скрипта))
    WHENGREATERTHANMENU: "LOUDNESS"=громкость | "TIMER"=таймер
    VALUE: число (по умолч. "10")
- event_whenbroadcastreceived — «когда я получу [BROADCAST_OPTION]» (шапка (старт скрипта))
    BROADCAST_OPTION: "имя сообщения"
- event_broadcast — «передать [BROADCAST_INPUT]» (команда)
    BROADCAST_INPUT: "имя сообщения" (или блок)
- event_broadcastandwait — «передать [BROADCAST_INPUT] и ждать до конца» (команда)
    BROADCAST_INPUT: "имя сообщения" (или блок)

## Управление [control]
- control_wait — «ждать [DURATION] секунд» (команда)
    DURATION: число ≥0 (по умолч. "1")
- control_repeat — «повторить [TIMES] раз {SUBSTACK}» (C-блок (с вложенными))
    TIMES: целое ≥0 (по умолч. "10")
    SUBSTACK: [блоки внутри]
- control_forever — «повторять всегда {SUBSTACK}» (C-блок, завершающий)
    SUBSTACK: [блоки внутри]
- control_if — «если [CONDITION] , то {SUBSTACK}» (C-блок (с вложенными))
    CONDITION: <условие-блок>
    SUBSTACK: [блоки внутри]
- control_if_else — «если [CONDITION] , то {SUBSTACK} иначе {SUBSTACK2}» (C-блок (с вложенными))
    CONDITION: <условие-блок>
    SUBSTACK: [блоки внутри]
    SUBSTACK2: [блоки внутри]
- control_wait_until — «ждать до [CONDITION]» (команда)
    CONDITION: <условие-блок>
- control_repeat_until — «повторять пока не [CONDITION] {SUBSTACK}» (C-блок (с вложенными))
    CONDITION: <условие-блок>
    SUBSTACK: [блоки внутри]
- control_create_clone_of — «создать клон [CLONE_OPTION]» (команда)
    CLONE_OPTION: имя/значение ("_myself_"=самого себя, или имя спрайта/костюма/звука) (или блок)
- control_start_as_clone — «когда я начинаю как клон» (шапка (старт скрипта))
- control_delete_this_clone — «удалить клон» (завершающая команда)
- control_stop — «стоп [STOP_OPTION]» (завершающая команда)
    STOP_OPTION: "all"=все | "this script"=этот скрипт | "other scripts in sprite"=другие скрипты спрайта

## Сенсоры [sensing]
- sensing_touchingobject — «касается [TOUCHINGOBJECTMENU]?» (условие (шестиугольное))
    TOUCHINGOBJECTMENU: имя/значение ("_mouse_"=указатель мыши, "_edge_"=край, или имя спрайта/костюма/звука) (или блок)
- sensing_touchingcolor — «касается цвета [COLOR]?» (условие (шестиугольное))
    COLOR: "#rrggbb" (по умолч. "#ff0000")
- sensing_coloristouchingcolor — «цвет [COLOR] касается цвета [COLOR2]?» (условие (шестиугольное))
    COLOR: "#rrggbb" (по умолч. "#ff0000")
    COLOR2: "#rrggbb" (по умолч. "#ff0000")
- sensing_distanceto — «расстояние до [DISTANCETOMENU]» (значение (круглое))
    DISTANCETOMENU: имя/значение ("_mouse_"=указатель мыши, или имя спрайта/костюма/звука) (или блок)
- sensing_askandwait — «спросить [QUESTION] и ждать» (команда)
    QUESTION: текст/число
- sensing_answer — «ответ» (значение (круглое))
- sensing_keypressed — «клавиша [KEY_OPTION] нажата?» (условие (шестиугольное))
    KEY_OPTION: "space"=пробел | "up arrow"=стрелка вверх | "down arrow"=стрелка вниз | "right arrow"=стрелка вправо | "left arrow"=стрелка влево | "any"=любая | "a"=a | "b"=b | "c"=c | "d"=d | "e"=e | "f"=f | "g"=g | "h"=h | "i"=i | "j"=j | "k"=k | "l"=l | "m"=m | "n"=n | "o"=o | "p"=p | "q"=q | "r"=r | "s"=s | "t"=t | "u"=u | "v"=v | "w"=w | "x"=x | "y"=y | "z"=z | "0"=0 | "1"=1 | "2"=2 | "3"=3 | "4"=4 | "5"=5 | "6"=6 | "7"=7 | "8"=8 | "9"=9 (или блок)
- sensing_mousedown — «мышь нажата?» (условие (шестиугольное))
- sensing_mousex — «x мыши» (значение (круглое))
- sensing_mousey — «y мыши» (значение (круглое))
- sensing_setdragmode — «перетаскивать [DRAG_MODE]» (команда)
    DRAG_MODE: "draggable"=можно | "not draggable"=нельзя
- sensing_loudness — «громкость» (значение (круглое))
- sensing_timer — «таймер» (значение (круглое))
- sensing_resettimer — «сбросить таймер» (команда)
- sensing_of — «[PROPERTY] от [OBJECT]» (значение (круглое))
    PROPERTY: "x position"=положение x | "y position"=положение y | "direction"=направление | "costume #"=костюм # | "costume name"=имя костюма | "size"=размер | "volume"=громкость | "backdrop #"=фон # | "backdrop name"=имя фона
    OBJECT: имя/значение ("Sprite1"=Sprite1, "_stage_"=Stage, или имя спрайта/костюма/звука) (или блок)
- sensing_current — «текущий [CURRENTMENU]» (значение (круглое))
    CURRENTMENU: "YEAR"=год | "MONTH"=месяц | "DATE"=дата | "DAYOFWEEK"=день недели | "HOUR"=час | "MINUTE"=минута | "SECOND"=секунда
- sensing_dayssince2000 — «дней с 2000 г» (значение (круглое))
- sensing_username — «имя участника» (значение (круглое))

## Операторы [operators]
- operator_add — «[NUM1] + [NUM2]» (значение (круглое))
    NUM1: число
    NUM2: число
- operator_subtract — «[NUM1] - [NUM2]» (значение (круглое))
    NUM1: число
    NUM2: число
- operator_multiply — «[NUM1] * [NUM2]» (значение (круглое))
    NUM1: число
    NUM2: число
- operator_divide — «[NUM1] / [NUM2]» (значение (круглое))
    NUM1: число
    NUM2: число
- operator_random — «выдать случайное от [FROM] до [TO]» (значение (круглое))
    FROM: число (по умолч. "1")
    TO: число (по умолч. "10")
- operator_gt — «[OPERAND1] > [OPERAND2]» (условие (шестиугольное))
    OPERAND1: текст/число
    OPERAND2: текст/число (по умолч. "50")
- operator_lt — «[OPERAND1] < [OPERAND2]» (условие (шестиугольное))
    OPERAND1: текст/число
    OPERAND2: текст/число (по умолч. "50")
- operator_equals — «[OPERAND1] = [OPERAND2]» (условие (шестиугольное))
    OPERAND1: текст/число
    OPERAND2: текст/число (по умолч. "50")
- operator_and — «[OPERAND1] и [OPERAND2]» (условие (шестиугольное))
    OPERAND1: <условие-блок>
    OPERAND2: <условие-блок>
- operator_or — «[OPERAND1] или [OPERAND2]» (условие (шестиугольное))
    OPERAND1: <условие-блок>
    OPERAND2: <условие-блок>
- operator_not — «не [OPERAND]» (условие (шестиугольное))
    OPERAND: <условие-блок>
- operator_join — «объединить [STRING1] [STRING2]» (значение (круглое))
    STRING1: текст/число (по умолч. "яблоко")
    STRING2: текст/число (по умолч. "банан")
- operator_letter_of — «буква [LETTER] в [STRING]» (значение (круглое))
    LETTER: целое ≥0 (по умолч. "1")
    STRING: текст/число (по умолч. "яблоко")
- operator_length — «длина [STRING]» (значение (круглое))
    STRING: текст/число (по умолч. "яблоко")
- operator_contains — «[STRING1] содержит [STRING2]?» (условие (шестиугольное))
    STRING1: текст/число (по умолч. "яблоко")
    STRING2: текст/число
- operator_mod — «[NUM1] модуль [NUM2]» (значение (круглое))
    NUM1: число
    NUM2: число
- operator_round — «округлить [NUM]» (значение (круглое))
    NUM: число
- operator_mathop — «[OPERATOR] от [NUM]» (значение (круглое))
    OPERATOR: "abs"=модуль | "floor"=целое меньшее | "ceiling"=целое большее | "sqrt"=квадратный корень | "sin"=sin | "cos"=cos | "tan"=tan | "asin"=asin | "acos"=acos | "atan"=atan | "ln"=ln | "log"=log | "e ^"=e ^ | "10 ^"=10 ^
    NUM: число

## Переменные и списки [data]
- data_variable — «[VARIABLE]» (значение (круглое))
    VARIABLE: "имя переменной"
- data_setvariableto — «задать [VARIABLE] значение [VALUE]» (команда)
    VARIABLE: "имя переменной"
    VALUE: текст/число (по умолч. "0")
- data_changevariableby — «изменить [VARIABLE] на [VALUE]» (команда)
    VARIABLE: "имя переменной"
    VALUE: число (по умолч. "1")
- data_showvariable — «показать переменную [VARIABLE]» (команда)
    VARIABLE: "имя переменной"
- data_hidevariable — «скрыть переменную [VARIABLE]» (команда)
    VARIABLE: "имя переменной"
- data_listcontents — «[LIST]» (значение (круглое))
    LIST: "имя переменной"
- data_listindexall — «[INDEX]» (значение (круглое))
    INDEX: значение
- data_listindexrandom — «[INDEX]» (значение (круглое))
    INDEX: значение
- data_addtolist — «добавить [ITEM] к [LIST]» (команда)
    LIST: "имя списка"
    ITEM: текст/число (по умолч. "вещь")
- data_deleteoflist — «удалить [INDEX] из [LIST]» (команда)
    LIST: "имя списка"
    INDEX: целое (по умолч. "1")
- data_deletealloflist — «удалить все из [LIST]» (команда)
    LIST: "имя списка"
- data_insertatlist — «вставить элемент [ITEM] в [LIST] на позицию с индексом [INDEX]» (команда)
    LIST: "имя списка"
    ITEM: текст/число (по умолч. "вещь")
    INDEX: целое (по умолч. "1")
- data_replaceitemoflist — «заменить элемент [INDEX] в [LIST] на [ITEM]» (команда)
    LIST: "имя списка"
    INDEX: целое (по умолч. "1")
    ITEM: текст/число (по умолч. "вещь")
- data_itemoflist — «элемент [INDEX] в [LIST]» (значение (круглое))
    LIST: "имя списка"
    INDEX: целое (по умолч. "1")
- data_itemnumoflist — «элемент # из [ITEM] в [LIST]» (значение (круглое))
    LIST: "имя списка"
    ITEM: текст/число (по умолч. "вещь")
- data_lengthoflist — «длина списка [LIST]» (значение (круглое))
    LIST: "имя списка"
- data_listcontainsitem — «[LIST] содержит [ITEM]?» (условие (шестиугольное))
    LIST: "имя списка"
    ITEM: текст/число (по умолч. "вещь")
- data_showlist — «показать список [LIST]» (команда)
    LIST: "имя списка"
- data_hidelist — «скрыть список [LIST]» (команда)
    LIST: "имя списка"

## Перо [pen]
- pen_clear — «стереть всё» (команда)
- pen_stamp — «печать» (команда)
- pen_penDown — «опустить перо» (команда)
- pen_penUp — «поднять перо» (команда)
- pen_setPenColorToColor — «установить для пера цвет %1» (команда)
    COLOR: "#rrggbb" (по умолч. "#ff0000")
- pen_changePenColorParamBy — «изменить %1 пера на %2» (команда)
    COLOR_PARAM: "color"=цвет | "saturation"=насыщенность | "brightness"=яркость | "transparency"=прозрачность (или блок)
    VALUE: число (по умолч. "10")
- pen_setPenColorParamTo — «установить перо %1 в %2» (команда)
    COLOR_PARAM: "color"=цвет | "saturation"=насыщенность | "brightness"=яркость | "transparency"=прозрачность (или блок)
    VALUE: число (по умолч. "50")
- pen_changePenSizeBy — «изменить размер пера на %1» (команда)
    SIZE: число (по умолч. "1")
- pen_setPenSizeTo — «установить размер пера %1» (команда)
    SIZE: число (по умолч. "1")

