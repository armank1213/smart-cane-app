import cv2
import numpy as np
import tflite_runtime.interpreter as tflite
import time
import bluetooth 

interpreter = tflite.Interpreter(model_path="detect.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

input_shape = input_details[0]['shape']
height, width = input_shape[1], input_shape[2]

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)

if not cap.isOpened():
    print("Cannot open camera")
    exit()

TARGET_PHONE_MAC = 'XX:XX:XX:XX:XX:XX'  
bt_socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)

print("Connecting to phone over Bluetooth...")
try:
    bt_socket.connect((TARGET_PHONE_MAC, 1))  # Port 1 is standard RFCOMM
    print("✅ Bluetooth connection established!")
except Exception as e:
    print(f"Bluetooth Connection Failed: {e}")
    exit()

last_message_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Can't receive frame. Exiting ...")
        break

    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray_frame_rgb = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)

    resized_frame = cv2.resize(gray_frame_rgb, (width, height))
    input_data = np.expand_dims(resized_frame, axis=0).astype(np.uint8)

    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()

    boxes = interpreter.get_tensor(output_details[0]['index'])[0]
    classes = interpreter.get_tensor(output_details[1]['index'])[0]
    scores = interpreter.get_tensor(output_details[2]['index'])[0]

    frame_height, frame_width = gray_frame.shape

    left_area = 0.0
    center_area = 0.0
    right_area = 0.0

    for i in range(len(scores)):
        if scores[i] > 0.5:
            ymin, xmin, ymax, xmax = boxes[i]
            box_area = (xmax - xmin) * (ymax - ymin)

            if box_area < 0.01:  # Ignore tiny detections
                continue

            x_center = (xmin + xmax) / 2

            if x_center < 0.33:
                left_area += box_area
            elif x_center > 0.66:
                right_area += box_area
            else:
                center_area += box_area

            xmin_pixel = int(xmin * frame_width)
            xmax_pixel = int(xmax * frame_width)
            ymin_pixel = int(ymin * frame_height)
            ymax_pixel = int(ymax * frame_height)

            cv2.rectangle(gray_frame, (xmin_pixel, ymin_pixel), (xmax_pixel, ymax_pixel), (255, 255, 255), 2)
            label = f"Object {int(classes[i])} ({scores[i]*100:.1f}%)"
            cv2.putText(gray_frame, label, (xmin_pixel, ymin_pixel - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    current_time = time.time()
    if current_time - last_message_time >= 5:
        direction_message = ""

        if left_area < center_area and left_area < right_area:
            direction_message = "Move left"
        elif right_area < center_area and right_area < left_area:
            direction_message = "Move right"
        else:
            direction_message = "Move forward"

        print(f"Sending over Bluetooth: {direction_message}")

        try:
            bt_socket.send(direction_message)
        except Exception as e:
            print(f"Bluetooth Send Error: {e}")

        last_message_time = current_time  # ✅ Update last message time

    cv2.namedWindow('Smart Cane Detection', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Smart Cane Detection', 640, 480)
    cv2.imshow('Smart Cane Detection', gray_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
bt_socket.close()
cv2.destroyAllWindows()
