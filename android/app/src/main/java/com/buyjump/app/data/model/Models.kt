package com.buyjump.app.data.model

enum class UserRole {
    USER,
    SELLER,
    ADMIN
}

enum class UserStatus {
    ACTIVE,
    SUSPENDED,
    PENDING
}

enum class SellerStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED
}

data class UserProfile(
    val uid: String = "",
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val role: UserRole = UserRole.USER,
    val status: UserStatus = UserStatus.ACTIVE,
    val photoUrl: String = ""
)

data class SellerProfile(
    val uid: String = "",
    val fullName: String = "",
    val businessName: String = "",
    val email: String = "",
    val phone: String = "",
    val address: String = "",
    val status: SellerStatus = SellerStatus.PENDING,
    val totalRevenue: Double = 0.0,
    val totalOrders: Int = 0
)

data class Product(
    val id: Int,
    val name: String,
    val description: String,
    val price: Double,
    val discountPrice: Double? = null,
    val stockQuantity: Int,
    val category: String,
    val brand: String,
    val imageUrl: String,
    val rating: Double = 4.8,
    val reviewCount: Int = 24,
    val isFeatured: Boolean = false,
    val isBestSeller: Boolean = false,
    val isNewArrival: Boolean = false,
    val specifications: String = "",
    val sellerId: String = ""
) {
    val displayPrice: Double get() = discountPrice ?: price
    val savingsPercent: Int get() = if (discountPrice != null && discountPrice < price) {
        (((price - discountPrice) / price) * 100).toInt()
    } else 0
}

data class Category(
    val id: Int,
    val name: String,
    val iconName: String,
    val imageUrl: String,
    val itemCount: Int
)

data class Banner(
    val id: Int,
    val title: String,
    val subtitle: String,
    val badgeText: String,
    val imageUrl: String,
    val actionText: String
)

data class CartItem(
    val id: String,
    val product: Product,
    val quantity: Int = 1,
    val selectedVariant: String = ""
)

data class Review(
    val id: Int,
    val customerName: String,
    val rating: Int,
    val comment: String,
    val date: String
)

enum class OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

data class Order(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val deliveryAddress: String,
    val itemsSummary: String,
    val subtotal: Double,
    val deliveryFee: Double,
    val totalAmount: Double,
    val paymentMethod: String,
    val status: OrderStatus = OrderStatus.PENDING,
    val createdAt: Long = System.currentTimeMillis()
)

data class Address(
    val id: String,
    val fullName: String,
    val phone: String,
    val streetAddress: String,
    val city: String,
    val postalCode: String,
    val isDefault: Boolean = false
)
