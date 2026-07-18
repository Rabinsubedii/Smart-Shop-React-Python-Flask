from flask import Blueprint, request, jsonify,current_app
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

import os
from werkzeug.utils import secure_filename

from extension import db, bcrypt
from models import User, Category, Product, ProductImage, Order, OrderItem,Wishlist,Review,Address,Cart

import requests

api = Blueprint("api", __name__)


# Admin helper
def is_admin():
    claims = get_jwt()
    return claims.get("role") == "ADMIN"


@api.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "API is working"}), 200


# =========================
# AUTH ROUTES
# =========================

@api.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"message": "Email already registered"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        role="USER"
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@api.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401
    
    if user.status == "BLOCKED":
        return jsonify({"message": "Your account has been blocked"}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@api.route("/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }), 200



@api.route("/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    data = request.get_json()

    user.full_name = data.get("full_name", user.full_name)
    user.email = data.get("email", user.email)

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully"
    }), 200



# =========================
# CATEGORY ROUTES
# =========================

@api.route("/categories", methods=["POST"])
@jwt_required()
def create_category():
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()

    name = data.get("name")
    description = data.get("description")
    image_url = data.get("image_url")

    if not name:
        return jsonify({"message": "Category name is required"}), 400

    existing_category = Category.query.filter_by(name=name).first()

    if existing_category:
        return jsonify({"message": "Category already exists"}), 409

    category = Category(
        name=name,
        description=description,
        image_url=image_url
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "Category created successfully",
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "image_url": category.image_url
        }
    }), 201


@api.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()

    result = []

    for category in categories:
        result.append({
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "image_url": category.image_url
        })

    return jsonify(result), 200


@api.route("/categories/<int:category_id>", methods=["GET"])
def get_category(category_id):
    category = Category.query.get(category_id)

    if not category:
        return jsonify({"message": "Category not found"}), 404

    return jsonify({
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "image_url": category.image_url
    }), 200


@api.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id):
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    category = Category.query.get(category_id)

    if not category:
        return jsonify({"message": "Category not found"}), 404

    data = request.get_json()

    category.name = data.get("name", category.name)
    category.description = data.get("description", category.description)
    category.image_url = data.get("image_url", category.image_url)

    db.session.commit()

    return jsonify({"message": "Category updated successfully"}), 200

@api.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    category = Category.query.get(category_id)

    if not category:
        return jsonify({"message": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "Category deleted successfully"}), 200


# =========================
# PRODUCT ROUTES
# =========================

@api.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    price = data.get("price")
    thumbnail_url = data.get("thumbnail_url")
    main_image_url = data.get("main_image_url")
    rating = data.get("rating", 0)
    discount = data.get("discount", 0)
    deal_score = data.get("deal_score", 0)
    category_id = data.get("category_id")
    images = data.get("images", [])

    if not title or price is None:
        return jsonify({"message": "Title and price are required"}), 400

    product = Product(
        title=title,
        description=description,
        price=price,
        thumbnail_url=thumbnail_url,
        main_image_url=main_image_url,
        rating=rating,
        discount=discount,
        deal_score=deal_score,
        category_id=category_id,
        source="LOCAL"
    )

    db.session.add(product)
    db.session.commit()

    for image_url in images:
        product_image = ProductImage(
            product_id=product.id,
            image_url=image_url
        )
        db.session.add(product_image)

    db.session.commit()

    return jsonify({
        "message": "Product created successfully",
        "product_id": product.id
    }), 201


@api.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": float(product.price),
            "thumbnail_url": product.thumbnail_url,
            "main_image_url": product.main_image_url,
            "rating": product.rating,
            "discount": product.discount,
            "deal_score": product.deal_score,
            "category_id": product.category_id,
            "source": product.source,
            "images": [
                image.image_url for image in product.images
            ]
        })

    return jsonify(result), 200


@api.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({
            "message": "Product not found"
        }), 404

    return jsonify({
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "price": float(product.price),
        "thumbnail_url": product.thumbnail_url,
        "main_image_url": product.main_image_url,
        "rating": float(product.rating or 0),
        "discount": float(product.discount or 0),
        "deal_score": float(product.deal_score or 0),

        "category": {
            "id": product.category.id if product.category else None,
            "name": product.category.name if product.category else None
        },

        "source": product.source,

        "images": [
            {
                "id": image.id,
                "url": image.image_url
            }
            for image in product.images
        ]
    }), 200

@api.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    data = request.get_json()

    product.title = data.get("title", product.title)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)

    product.thumbnail_url = data.get(
        "thumbnail_url",
        product.thumbnail_url
    )

    product.main_image_url = data.get(
        "main_image_url",
        product.main_image_url
    )

    product.rating = data.get(
        "rating",
        product.rating
    )

    product.discount = data.get(
        "discount",
        product.discount
    )

    product.deal_score = data.get(
        "deal_score",
        product.deal_score
    )

    product.category_id = data.get(
        "category_id",
        product.category_id
    )

    product.source = data.get(
        "source",
        product.source
    )

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully"
    }), 200


@api.route("/upload-image", methods=["POST"])
@jwt_required()
def upload_image():
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    if "image" not in request.files:
        return jsonify({"message": "No image file uploaded"}), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({"message": "No selected image"}), 400

    allowed_extensions = {"png", "jpg", "jpeg", "gif", "webp"}

    if "." not in image.filename:
        return jsonify({"message": "Invalid image file"}), 400

    extension = image.filename.rsplit(".", 1)[1].lower()

    if extension not in allowed_extensions:
        return jsonify({"message": "Only image files are allowed"}), 400

    filename = secure_filename(image.filename)

    upload_folder = os.path.join(current_app.root_path, "uploads")
    os.makedirs(upload_folder, exist_ok=True)

    image_path = os.path.join(upload_folder, filename)
    image.save(image_path)

    image_url = f"http://127.0.0.1:5000/uploads/{filename}"

    return jsonify({
        "message": "Image uploaded successfully",
        "image_url": image_url
    }), 201

    
@api.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    ProductImage.query.filter_by(
        product_id=product.id
    ).delete()

    Wishlist.query.filter_by(
        product_id=product.id
    ).delete()

    Cart.query.filter_by(
        product_id=product.id
    ).delete()

    Review.query.filter_by(
        product_id=product.id
    ).delete()

    OrderItem.query.filter_by(
        product_id=product.id
    ).delete()

    db.session.delete(product)

    db.session.commit()

    return jsonify({
        "message": "Product deleted successfully"
    }), 200

@api.route("/external/fakestore", methods=["GET"])
def get_fakestore_products():
    url = "https://fakestoreapi.com/products"

    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({"message": "Failed to fetch FakeStore products"}), 500

    products = response.json()

    result = []

    for product in products:
        result.append({
            "external_id": str(product.get("id")),
            "source": "FakeStore",
            "title": product.get("title"),
            "description": product.get("description"),
            "price": product.get("price"),
            "thumbnail_url": product.get("image"),
            "main_image_url": product.get("image"),
            "category": product.get("category"),
            "rating": product.get("rating", {}).get("rate", 0),
            "discount": 0
        })

    return jsonify(result), 200


# dummyjson.com/products

@api.route("/external/dummyjson", methods=["GET"])
def get_dummyjson_products():
    url = "https://dummyjson.com/products"

    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({"message": "Failed to fetch DummyJSON products"}), 500

    data = response.json()
    products = data.get("products", [])

    result = []

    for product in products:
        result.append({
            "external_id": str(product.get("id")),
            "source": "DummyJSON",
            "title": product.get("title"),
            "description": product.get("description"),
            "price": product.get("price"),
            "thumbnail_url": product.get("thumbnail"),
            "main_image_url": product.get("images", [None])[0],
            "images": product.get("images", []),
            "category": product.get("category"),
            "rating": product.get("rating", 0),
            "discount": product.get("discountPercentage", 0)
        })

    return jsonify(result), 200


    # best deals
    
@api.route("/recommendations/best-deals", methods=["GET"])
def best_deals():
    deals = []
    warnings = []

    # FakeStore API
    try:
        fake_response = requests.get(
            "https://fakestoreapi.com/products",
            timeout=15
        )
        fake_response.raise_for_status()

        fake_products = fake_response.json()

        for product in fake_products:
            rating = float(
                product.get("rating", {}).get("rate", 0)
            )
            price = float(product.get("price", 0))
            discount = 0

            deal_score = (rating * 20) - (price / 10)

            deals.append({
                "id": f"fakestore-{product.get('id')}",
                "external_id": product.get("id"),
                "source": "FakeStore",
                "title": product.get("title", "Unknown Product"),
                "price": price,
                "rating": rating,
                "discount": discount,
                "deal_score": round(deal_score, 2),
                "thumbnail_url": product.get("image", "")
            })

    except requests.RequestException as error:
        print(f"FakeStore API error: {error}")
        warnings.append("FakeStore API failed")

    # DummyJSON API
    try:
        dummy_response = requests.get(
            "https://dummyjson.com/products?limit=100",
            timeout=15
        )
        dummy_response.raise_for_status()

        dummy_products = dummy_response.json().get("products", [])

        for product in dummy_products:
            rating = float(product.get("rating", 0))
            price = float(product.get("price", 0))
            discount = float(
                product.get("discountPercentage", 0)
            )

            deal_score = (
                (rating * 20)
                + discount
                - (price / 10)
            )

            deals.append({
                "id": f"dummyjson-{product.get('id')}",
                "external_id": product.get("id"),
                "source": "DummyJSON",
                "title": product.get("title", "Unknown Product"),
                "price": price,
                "rating": rating,
                "discount": discount,
                "deal_score": round(deal_score, 2),
                "thumbnail_url": product.get("thumbnail", "")
            })

    except requests.RequestException as error:
        print(f"DummyJSON API error: {error}")
        warnings.append("DummyJSON API failed")

    if not deals:
        return jsonify({
            "message": "Both external APIs are unavailable.",
            "warnings": warnings
        }), 503

    deals.sort(
        key=lambda product: product["deal_score"],
        reverse=True
    )

    return jsonify(deals[:20]), 200
# =========================
# ORDER ROUTES
# =========================

@api.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    address_id = data.get("address_id")
    items = data.get("items", [])

    if not address_id:
        return jsonify({"message": "Address is required"}), 400

    address = Address.query.filter_by(
        id=address_id,
        user_id=user_id
    ).first()

    if not address:
        return jsonify({"message": "Address not found"}), 404

    if not items:
        return jsonify({"message": "Order items are required"}), 400

    total_amount = 0
    order_items_data = []

    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)

        if not product_id:
            return jsonify({"message": "Product ID is required"}), 400

        if quantity <= 0:
            return jsonify({"message": "Quantity must be greater than 0"}), 400

        product = Product.query.get(product_id)

        if not product:
            return jsonify({
                "message": f"Product with id {product_id} not found"
            }), 404

        item_total = float(product.price) * quantity
        total_amount += item_total

        order_items_data.append({
            "product": product,
            "quantity": quantity,
            "price": product.price
        })

    order = Order(
        user_id=user_id,
        address_id=address_id,
        total_amount=total_amount,
        status="Pending",
        payment_method="Cash on Delivery",
        payment_status="Pending"
    )

    db.session.add(order)
    db.session.commit()

    for item in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price=item["price"]
        )

        db.session.add(order_item)

    db.session.commit()

    return jsonify({
        "message": "Order placed successfully",
        "order_id": order.id,
        "total_amount": total_amount,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "shipping_address": {
            "full_name": address.full_name,
            "phone": address.phone,
            "country": address.country,
            "city": address.city,
            "postal_code": address.postal_code,
            "street_address": address.street_address
        }
    }), 201


@api.route("/orders/my-orders", methods=["GET"])
@jwt_required()
def my_orders():

    user_id = int(get_jwt_identity())

    orders = Order.query.filter_by(user_id=user_id)\
        .order_by(Order.created_at.desc())\
        .all()

    result = []

    for order in orders:

        items = []

        for item in order.order_items:
            items.append({
                "product_id": item.product.id,
                "product_title": item.product.title,
                "product_image": item.product.thumbnail_url,
                "quantity": item.quantity,
                "price": float(item.price)
            })

        result.append({
            "id": order.id,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "created_at": order.created_at,

            "shipping_address": {
                "full_name": order.address.full_name,
                "phone": order.address.phone,
                "country": order.address.country,
                "city": order.address.city,
                "postal_code": order.address.postal_code,
                "street_address": order.address.street_address
            } if order.address else None,

            "items": items
        })

    return jsonify(result), 200



@api.route("/admin/orders", methods=["GET"])
@jwt_required()
def get_all_orders():

    if not is_admin():
        return jsonify({
            "message": "Admin access required"
        }), 403

    orders = Order.query.all()

    result = []

    for order in orders:
        result.append({
            "order_id": order.id,
            "customer_name": order.user.full_name,
            "customer_email": order.user.email,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at,
            "items": [
                {
                    "product_id": item.product_id,
                    "product_title": item.product.title,
                    "quantity": item.quantity,
                    "price": float(item.price)
                }
                for item in order.order_items
            ]
        })

    return jsonify(result), 200


@api.route("/admin/orders/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    order = Order.query.get(order_id)

    if not order:
        return jsonify({"message": "Order not found"}), 404

    data = request.get_json()
    status = data.get("status")

    allowed_status = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

    if status not in allowed_status:
        return jsonify({"message": "Invalid order status"}), 400

    order.status = status
    db.session.commit()

    return jsonify({
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }), 200


@api.route("/admin/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def admin_order_details(order_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    order = Order.query.get(order_id)

    if not order:
        return jsonify({"message": "Order not found"}), 404

    items = []

    for item in order.order_items:
        items.append({
            "product_id": item.product.id,
            "product_title": item.product.title,
            "product_image": item.product.thumbnail_url,
            "quantity": item.quantity,
            "price": float(item.price),
            "subtotal": float(item.price) * item.quantity
        })

    return jsonify({
        "id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "total_amount": float(order.total_amount),
        "created_at": order.created_at.isoformat(),

        "customer": {
            "id": order.user.id,
            "full_name": order.user.full_name,
            "email": order.user.email
        } if order.user else None,

        "shipping_address": {
            "full_name": order.address.full_name,
            "phone": order.address.phone,
            "country": order.address.country,
            "city": order.address.city,
            "postal_code": order.address.postal_code,
            "street_address": order.address.street_address
        } if order.address else None,

        "items": items
    }), 200

# wishlist
@api.route("/wishlist", methods=["POST"])
@jwt_required()
def add_to_wishlist():
    user_id = get_jwt_identity()
    data = request.get_json()

    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"message": "Product ID is required"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    existing = Wishlist.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first()

    if existing:
        return jsonify({"message": "Product already in wishlist"}), 409

    wishlist_item = Wishlist(
        user_id=user_id,
        product_id=product_id
    )

    db.session.add(wishlist_item)
    db.session.commit()

    return jsonify({"message": "Product added to wishlist"}), 201



@api.route("/wishlist", methods=["GET"])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()

    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()

    result = []

    for item in wishlist_items:
        result.append({
            "wishlist_id": item.id,
            "product": {
                "id": item.product.id,
                "title": item.product.title,
                "price": float(item.product.price),
                "thumbnail_url": item.product.thumbnail_url,
                "rating": item.product.rating,
                "discount": item.product.discount
            }
        })

    return jsonify(result), 200



@api.route("/wishlist/<int:wishlist_id>", methods=["DELETE"])
@jwt_required()
def remove_from_wishlist(wishlist_id):
    user_id = get_jwt_identity()

    wishlist_item = Wishlist.query.filter_by(
        id=wishlist_id,
        user_id=user_id
    ).first()

    if not wishlist_item:
        return jsonify({"message": "Wishlist item not found"}), 404

    db.session.delete(wishlist_item)
    db.session.commit()

    return jsonify({"message": "Product removed from wishlist"}), 200


# review route
@api.route("/reviews", methods=["POST"])
@jwt_required()
def add_review():
    user_id = get_jwt_identity()
    data = request.get_json()

    product_id = data.get("product_id")
    rating = data.get("rating")
    comment = data.get("comment")

    if not product_id or not rating:
        return jsonify({"message": "Product ID and rating are required"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    review = Review(
        user_id=user_id,
        product_id=product_id,
        rating=rating,
        comment=comment
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({"message": "Review added successfully"}), 201


@api.route("/products/<int:product_id>/reviews", methods=["GET"])
def get_product_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).all()

    result = []

    for review in reviews:
        result.append({
            "id": review.id,
            "user": review.user.full_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        })

    return jsonify(result), 200

    # admin  dashbaord
@api.route("/admin/dashboard", methods=["GET"])
@jwt_required()
def admin_dashboard():

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    total_revenue = db.session.query(
        db.func.sum(Order.total_amount)
    ).scalar() or 0

    recent_orders = Order.query.order_by(
        Order.created_at.desc()
    ).limit(5).all()

    return jsonify({
        "total_users": User.query.count(),
        "total_products": Product.query.count(),
        "total_categories": Category.query.count(),
        "total_orders": Order.query.count(),
        "total_revenue": float(total_revenue),

        "order_status": {
            "pending": Order.query.filter_by(status="Pending").count(),
            "processing": Order.query.filter_by(status="Processing").count(),
            "shipped": Order.query.filter_by(status="Shipped").count(),
            "delivered": Order.query.filter_by(status="Delivered").count(),
            "cancelled": Order.query.filter_by(status="Cancelled").count()
        },

        "recent_orders": [
            {
                "id": order.id,
                "customer": order.user.full_name if order.user else "Unknown",
                "total_amount": float(order.total_amount),
                "status": order.status,
                "payment_method": order.payment_method,
                "created_at": order.created_at.isoformat()
            }
            for order in recent_orders
        ]
    }), 200



# view all users
@api.route("/admin/users", methods=["GET"])
@jwt_required()
def get_all_users():

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    users = User.query.all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at
        })

    return jsonify(result), 200

# update user
@api.route("/admin/users/<int:user_id>/role", methods=["PUT"])
@jwt_required()
def update_user_role(user_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    role = data.get("role")

    if role not in ["USER", "ADMIN"]:
        return jsonify({"message": "Invalid role"}), 400

    user.role = role
    db.session.commit()

    return jsonify({
        "message": "Role updated successfully",
        "user_id": user.id,
        "role": user.role
    }), 200


# delete user
@api.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):

    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "User deleted successfully"
    }), 200


# block user
@api.route("/admin/users/<int:user_id>/block", methods=["PUT"])
@jwt_required()
def block_user(user_id):
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.status = "BLOCKED"
    db.session.commit()

    return jsonify({"message": "User blocked successfully"}), 200


@api.route("/admin/users/<int:user_id>/unblock", methods=["PUT"])
@jwt_required()
def unblock_user(user_id):
    if not is_admin():
        return jsonify({"message": "Admin access required"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.status = "ACTIVE"
    db.session.commit()

    return jsonify({"message": "User unblocked successfully"}), 200


    # product search

@api.route("/products/search", methods=["GET"])
def search_products():

    query = request.args.get("q", "")

    products = Product.query.filter(
        Product.title.ilike(f"%{query}%")
    ).all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "title": product.title,
            "price": float(product.price),
            "thumbnail_url": product.thumbnail_url
        })

    return jsonify(result), 200


@api.route("/products/category/<int:category_id>", methods=["GET"])
def products_by_category(category_id):

    products = Product.query.filter_by(
        category_id=category_id
    ).all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "title": product.title,
            "price": float(product.price),
            "thumbnail_url": product.thumbnail_url
        })

    return jsonify(result), 200


@api.route("/addresses", methods=["POST"])
@jwt_required()
def create_address():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    address = Address(
        user_id=user_id,
        full_name=data.get("full_name"),
        phone=data.get("phone"),
        country=data.get("country", "Japan"),
        city=data.get("city"),
        postal_code=data.get("postal_code"),
        street_address=data.get("street_address"),
        is_default=data.get("is_default", False)
    )

    db.session.add(address)
    db.session.commit()

    return jsonify({"message": "Address added successfully"}), 201


@api.route("/addresses", methods=["GET"])
@jwt_required()
def get_addresses():
    user_id = int(get_jwt_identity())

    addresses = Address.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": address.id,
            "full_name": address.full_name,
            "phone": address.phone,
            "country": address.country,
            "city": address.city,
            "postal_code": address.postal_code,
            "street_address": address.street_address,
            "is_default": address.is_default
        }
        for address in addresses
    ]), 200


@api.route("/addresses/default", methods=["GET"])
@jwt_required()
def get_default_address():

    user_id = int(get_jwt_identity())

    address = Address.query.filter_by(
        user_id=user_id,
        is_default=True
    ).first()

    if not address:
        return jsonify({}), 200

    return jsonify({
        "id": address.id,
        "full_name": address.full_name,
        "phone": address.phone,
        "country": address.country,
        "city": address.city,
        "postal_code": address.postal_code,
        "street_address": address.street_address
    }), 200

@api.route("/addresses/default", methods=["PUT"])
@jwt_required()
def update_default_address():

    user_id = int(get_jwt_identity())

    address = Address.query.filter_by(
        user_id=user_id,
        is_default=True
    ).first()

    if not address:
        return jsonify({
            "message": "Default address not found"
        }), 404

    data = request.get_json()

    address.full_name = data.get("full_name")
    address.phone = data.get("phone")
    address.country = data.get("country")
    address.city = data.get("city")
    address.postal_code = data.get("postal_code")
    address.street_address = data.get("street_address")

    db.session.commit()

    return jsonify({
        "message": "Address updated successfully"
    }), 200



@api.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    existing_item = Cart.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first()

    if existing_item:
        existing_item.quantity += quantity
    else:
        cart_item = Cart(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity
        )

        db.session.add(cart_item)

    db.session.commit()

    return jsonify({
        "message": "Product added to cart"
    }), 201


@api.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())

    cart_items = Cart.query.filter_by(user_id=user_id).all()

    result = []

    for item in cart_items:
        result.append({
            "cart_id": item.id,
            "quantity": item.quantity,
            "product": {
                "id": item.product.id,
                "title": item.product.title,
                "price": float(item.product.price),
                "thumbnail_url": item.product.thumbnail_url
            },
            "subtotal": float(item.product.price) * item.quantity
        })

    return jsonify(result), 200


@api.route("/cart/<int:cart_id>", methods=["PUT"])
@jwt_required()
def update_cart_quantity(cart_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    quantity = data.get("quantity")

    if quantity is None or quantity <= 0:
        return jsonify({"message": "Quantity must be greater than 0"}), 400

    cart_item = Cart.query.filter_by(id=cart_id, user_id=user_id).first()

    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404

    cart_item.quantity = quantity
    db.session.commit()

    return jsonify({"message": "Cart quantity updated"}), 200


@api.route("/cart/<int:cart_id>", methods=["DELETE"])
@jwt_required()
def remove_cart_item(cart_id):
    user_id = int(get_jwt_identity())

    cart_item = Cart.query.filter_by(id=cart_id, user_id=user_id).first()

    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Cart item removed"}), 200


@api.route("/cart/checkout", methods=["POST"])
@jwt_required()
def checkout_cart():

    user_id = int(get_jwt_identity())

    data = request.get_json()
    address_id = data.get("address_id")

    if not address_id:
        return jsonify({"message": "Address is required"}), 400

    address = Address.query.filter_by(
        id=address_id,
        user_id=user_id
    ).first()

    if not address:
        return jsonify({"message": "Address not found"}), 404

    cart_items = Cart.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400

    total_amount = 0

    order = Order(
        user_id=user_id,
        address_id=address_id,
        status="Pending",
        payment_method="Cash on Delivery",
        payment_status="Pending",
        total_amount=0
    )

    db.session.add(order)
    db.session.commit()

    for item in cart_items:

        subtotal = float(item.product.price) * item.quantity
        total_amount += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.product.price
        )

        db.session.add(order_item)

    order.total_amount = total_amount

    for item in cart_items:
        db.session.delete(item)

    db.session.commit()

    return jsonify({
        "message": "Order placed successfully",
        "order_id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "total_amount": total_amount
    }), 201

@api.route("/auth/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({
            "message": "Current password and new password are required"
        }), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")

    db.session.commit()

    return jsonify({
        "message": "Password changed successfully"
    }), 200


@api.route("/addresses/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_address(id):
    user_id = get_jwt_identity()

    address = Address.query.filter_by(id=id, user_id=user_id).first()

    if not address:
        return jsonify({"message": "Address not found"}), 404

    db.session.delete(address)
    db.session.commit()

    return jsonify({"message": "Address deleted successfully"})