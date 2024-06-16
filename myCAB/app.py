from flask import Flask, jsonify, render_template, session, redirect, request, url_for
from functools import wraps
import pymongo
from geopy.distance import geodesic
from bson import ObjectId  # Ensure this is imported to handle ObjectId

app = Flask(__name__)
app.secret_key = b'\xcc^\x91\xea\x17-\xd0W\x03\xa7\xf8J0\xac8\xc5'

# Database
client = pymongo.MongoClient('localhost', 27017)
db = client.user_login_system

# Decorators
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            return redirect('/')
    return wrap

# Routes
from user import routes

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard/')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/find_ride', methods=['POST'])
@login_required
def find_ride():
    pickup = request.form.get('pickup')
    drop = request.form.get('drop')
    app.logger.info('Attempting to find a ride...')
    # Validate pickup and drop values
    if not pickup or not drop:
        return jsonify({'error': 'Please enter both pickup and drop locations.'}), 400
    
    try:
        pickup_lat, pickup_lng = map(float, pickup.split(","))
    except ValueError:
        return jsonify({'error': 'Invalid pickup location'}), 400
    
    # Find the nearest available cab
    nearest_cab = None
    min_distance = float('inf')

    for cab in db.cabs.find({"CurrentStatus": "available"}):
        cab_location = (cab['CurrentLocation']['lat'], cab['CurrentLocation']['lng'])
        distance = geodesic((pickup_lat, pickup_lng), cab_location).miles
        if distance < min_distance:
            nearest_cab = cab
            min_distance = distance

    if nearest_cab:
        return jsonify({'redirect_url': url_for('cab_info', cab_id=str(nearest_cab['_id']))})
    else:
        return jsonify({'error': 'No available cabs found'}), 404
    



@app.route('/cab_info/<cab_id>')
@login_required
def cab_info(cab_id):
    cab = db.cabs.find_one({"_id": ObjectId(cab_id)})
    if not cab:
        return "Cab not found", 404
    return render_template('cab_info.html', cab=cab)


if __name__ == '__main__':
    app.run(debug=True)
