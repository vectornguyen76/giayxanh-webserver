# Automatic Paper Spreading Machine Integrated Control and Monitoring System Via IoT

# Website
https://giayxanh.online/

# How to Deploy on Nginx - Ubuntu Server 18.04
## 1. Update and upgrade
```
sudo apt update
sudo apt upgrade
```
## 2. Install Nginx
```
sudo apt install nginx
```
## 3. Create 1 file on sites-enabled in Nginx
```
sudo nano /etc/nginx/sites-enabled/giayxanh
```
## 4. Add context
```
server {
	listen 80;

	server_name giayxanh.online;

	location / {
		proxy_pass http://127.0.0.1:8080;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For- $proxy_add_x_forwarded_for;
	}
}
```
## 5. Unlink default file on site-enabled
```
sudo unlink /etc/nginx/sites-enabled/default
```
## 6. Test to make sure that there are no syntax errors in any of your Nginx files
```
sudo nginx -t
```
## 7. Reload Nginx
```
sudo nginx -s reload
```
## 8. Install python 3.8
```
sudo apt install python3-pip

sudo apt install python3.8
```
## 9. Add python3 choice using python3.6
```
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.6 1
```
## 10. Add python3 choice using python3.8
```
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 2
```
## 11. Install pip and requirements.txt
```
pip3 install --upgrade pip

pip3 install -r requirements.txt
```
## 12. Install gunicorn3
```
sudo apt install gunicorn3
```
## 15. Finally build and run app on gunicorn3
```
gunicorn3 --bind=0.0.0.0:8080 --timeout 200 app:app --daemon
```
## 15. Kill gunicorn3 if you stop the app
```
sudo pkill -f gunicorn3
```

# Result
![Screenshot 2022-06-14 100923](https://user-images.githubusercontent.com/80930272/173485895-3bbc62cd-ea58-4c2c-898e-43963937b7d6.png)
![Screenshot 2022-06-14 101106](https://user-images.githubusercontent.com/80930272/173485898-ca638d50-651d-4cff-a69f-26a84c91f4c5.png)
![Screenshot 2022-06-14 101131](https://user-images.githubusercontent.com/80930272/173485900-b1d54eb7-fbc1-4efd-961f-053ef88d6946.png)
![Screenshot 2022-06-14 101153](https://user-images.githubusercontent.com/80930272/173485892-d0862bbd-1cb9-4a81-a384-611708771b71.png)
