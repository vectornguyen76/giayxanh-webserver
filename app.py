from flask import Flask, redirect, render_template, url_for, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dataclasses import dataclass
from flask_mqtt import Mqtt

app = Flask(__name__)

# Config database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# Config MQTT
app.config['MQTT_BROKER_URL'] = 'broker.emqx.io'
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = 'emqx'  # Set this item when you need to verify username and password
app.config['MQTT_PASSWORD'] = 'public'  # Set this item when you need to verify username and password
app.config['MQTT_KEEPALIVE'] = 5  # Set KeepAlive time in seconds
app.config['MQTT_TLS_ENABLED'] = False  # If your broker supports TLS, set it True
sub_topic = 'mqtt/quantity'
pub_topic = 'mqtt/control'
mqtt_client = Mqtt(app)

# Connect MQTT
@mqtt_client.on_connect()
def handle_connect(client, userdata, flags, rc):
   if rc == 0:
       print('Connected successfully')
       mqtt_client.subscribe(sub_topic) # subscribe topic
   else:
       print('Bad connection. Code:', rc)

# Subcribe from broker
@mqtt_client.on_message()
def handle_mqtt_message(client, userdata, message):
    data = dict(
       topic=message.topic,
       payload=message.payload.decode()
   )
    print('Received message on topic: {topic} with payload: {payload}'.format(**data))
    
    # Add new quantity read from MQTT-Broker to Quantity Table  
    quantity = int(message.payload.decode())
    new_quantity = Quantity(quantity = quantity)
    db.session.add(new_quantity)
    db.session.commit()
    
    # Process quantity and add value to Report Table
    date_today = datetime.date(datetime.now())
    report = Report.query.filter(Report.date.startswith(str(date_today))).all()
    if report == []:
        # Reset counter in PLC
        publish_message(id_reset= 1)
        
        # Add new record
        new_report = Report(quantity = 1, date = datetime.now(), 
                            start_time = datetime.utcnow(), 
                            finish_time = datetime.utcnow())
        db.session.add(new_report)
        db.session.commit()
    else:
        # Get id
        id = report[0].id
        
        # Update record by id 
        last_report = Report.query.filter_by(id=id).first()
        last_report.quantity = quantity
        last_report.finish_time = datetime.utcnow()
        db.session.commit()
        
# Pusblish
# @app.route('/api/mqtt', methods=['POST'])
def publish_message(id_reset = 0):
    control = Control.query.filter_by(id=1).first()
    msg = f"{control.status}-{control.mode}-{control.run}-{control.set_init}-{control.pump}-{control.reset_time}-{control.dip_time}-{control.dry_time}-{control.extract_time}-{id_reset}"
    
    publish_result = mqtt_client.publish(pub_topic, msg)
    status = publish_result[0]
    if status == 0:
        print(f"Send '{msg}' to topic '{pub_topic}'")
    else:
        print(f"Failed to send message to topic {pub_topic}")
    return "OK"

@dataclass
class Account(db.Model):
    id: int
    username: str
    password: str
    
    id = db.Column(db.Integer, primary_key = True) #, auto_increment=True
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(50))
    date_created = db.Column(db.DateTime, default = datetime.utcnow)
    
    def __repr__(self):
        return '<Account %r>' % self.id

@dataclass
class Control(db.Model):
    status : int 
    mode : int 
    run : int 
    set_init : int 
    pump : int 
    reset_time : int
    dip_time : int 
    dry_time : int 
    extract_time : int 
    
    id = db.Column(db.Integer, primary_key = True)
    status = db.Column(db.Integer, default = 0) 
    mode = db.Column(db.Integer, default = 0) 
    run = db.Column(db.Integer, default = 0) 
    set_init = db.Column(db.Integer, default = 0) 
    pump = db.Column(db.Integer, default = 0) 
    reset_time = db.Column(db.Integer, default = 0)
    dip_time = db.Column(db.Integer, default = 0) 
    dry_time = db.Column(db.Integer, default = 0) 
    extract_time = db.Column(db.Integer, default = 0) 
    def __repr__(self):
        return '<Control %r>' % self.id
@dataclass
class Quantity(db.Model):
    id : int 
    quantity : int 
    datetime : datetime 
    
    id = db.Column(db.Integer, primary_key = True)
    quantity = db.Column(db.Integer, nullable = False)
    datetime = db.Column(db.DateTime, default = datetime.utcnow)
    
    def __repr__(self):
        return '<Quantity %r>' % self.id

@dataclass
class Report(db.Model):
    id : int 
    quantity : int 
    date : datetime
    start_time : datetime 
    finish_time : datetime 
    
    id = db.Column(db.Integer, primary_key = True)
    quantity = db.Column(db.Integer)
    date = db.Column(db.DateTime)
    start_time = db.Column(db.DateTime)
    finish_time = db.Column(db.DateTime)
    
    def __repr__(self):
        return '<Report %r>' % self.id

# API report
@app.route('/api/report', methods=['GET'])
def report_table():
    reports = Report.query.all()
    return jsonify(reports)  

# API get control
@app.route('/api/control', methods=['GET'])
def get_control():
    control = Control.query.all()
    return jsonify(control)      

# API get quantity
@app.route('/api/get-quantity', methods=['GET'])
def get_quantity():
    # Get all id 
    reports = Quantity.query.filter(Quantity.id).all()
    if reports != []:
        # Find max id
        max_id = reports[-1].id
        
        # Get top 10 id last
        result = Quantity.query.filter(Quantity.id >= (max_id - 10)).all()
        
        # Return json
        return jsonify(result)  
    else:
        return "Null"
    
# API update control
@app.route('/api/update-control', methods=['POST'])
def update_control():
    status = request.form['dtStatus']
    mode = request.form['dtMode']
    run = request.form['dtRun']
    set_init = request.form['dtSet']
    pump = request.form['dtPump']
    
    control = Control.query.filter_by(id=1).first()
    if control != None:
        control.status = status
        control.mode = mode
        control.run = run
        control.set_init = set_init
        control.pump = pump
        db.session.commit()
    else:
        new_control = Control(status = status, mode = mode, run = run, 
                          set_init = set_init, pump = pump)
        db.session.add(new_control)
        db.session.commit()

    # Publish data to MQTT-Broker
    publish_message()
    return "OK"
    
        
# API update timer
@app.route('/api/update-timer', methods=['POST'])
def update_timer():
    reset_time = request.form['reset_time']
    dip_time = request.form['dip_time']
    dry_time = request.form['dry_time']
    extract_time = request.form['extract_time']
    
    control = Control.query.filter_by(id=1).first()
    if control != None:
        control.reset_time = reset_time
        control.dip_time = dip_time
        control.dry_time = dry_time
        control.extract_time = extract_time
        db.session.commit()
    else:
        new_control = Control(reset_time = reset_time, dip_time = dip_time, 
                              dry_time = dry_time, extract_time = extract_time)
        db.session.add(new_control)
        db.session.commit()
    
    # Publish data to MQTT-Broker
    publish_message()
    return "OK"
        
# API account
@app.route('/api/account', methods=['GET','POST'])
def account():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        new_account = Account(username = username, password = password)
        try:
            db.session.add(new_account)
            db.session.commit()
            # return redirect('/register')
            return "OK"
        except:
            return "ERROR"
    else:
        users = Account.query.all()
        return jsonify(users)  
        
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/control')
def control():
    return render_template('control.html')

@app.route('/tables')
def tables():
    return render_template('tables.html')

@app.route('/charts')
def charts():
    return render_template('charts.html')

@app.route('/intro')
def intro():
    return render_template('intro.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=False)
