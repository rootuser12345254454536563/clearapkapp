package com.buyjump.app.data.repository

import com.buyjump.app.data.model.*
import java.util.UUID

class ObservableState<T>(initialValue: T) {
    var value: T = initialValue
        private set
    private val listeners = mutableListOf<(T) -> Unit>()

    fun update(newValue: T) {
        value = newValue
        listeners.forEach { it(newValue) }
    }

    fun observe(listener: (T) -> Unit) {
        listeners.add(listener)
        listener(value)
    }
}

object BuyJumpRepository {

    val currentUser = ObservableState<UserProfile?>(null)
    val currentSeller = ObservableState<SellerProfile?>(null)
    val isAdmin = ObservableState(false)
    val isGuest = ObservableState(false)

    val banners = listOf(
        Banner(
            id = 1,
            title = "Super Value Electronics Sale",
            subtitle = "Up to 45% OFF on Flagship Smartphones & Audio",
            badgeText = "MEGA DEAL",
            imageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&q=80",
            actionText = "Shop Now"
        ),
        Banner(
            id = 2,
            title = "Express Islandwide Delivery",
            subtitle = "Same-day dispatch on verified BUYJUMP Mall items",
            badgeText = "FAST SHIPPING",
            imageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80",
            actionText = "Explore"
        )
    )

    val categories = listOf(
        Category(1, "Electronics", "Devices", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", 142),
        Category(2, "Fashion", "Apparel", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80", 98),
        Category(3, "Home & Living", "Home", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80", 76),
        Category(4, "Sports", "Fitness", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", 54)
    )

    val products = ObservableState(
        listOf(
            Product(
                id = 101,
                name = "Pro ANC Wireless Headphones Studio X",
                description = "Active Noise Cancelling wireless headphones with 40-hour battery life.",
                price = 21000.0,
                discountPrice = 14500.0,
                stockQuantity = 28,
                category = "Electronics",
                brand = "TechZone",
                imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
                rating = 4.8,
                reviewCount = 342,
                isFeatured = true,
                isBestSeller = true
            ),
            Product(
                id = 102,
                name = "Smart Fitness Watch AMOLED Series 9",
                description = "1.96-inch Super AMOLED display, 24/7 heart rate & SpO2 monitoring.",
                price = 14900.0,
                discountPrice = 9800.0,
                stockQuantity = 45,
                category = "Electronics",
                brand = "FitPulse",
                imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
                rating = 4.7,
                reviewCount = 219,
                isFeatured = true,
                isBestSeller = true
            )
        )
    )

    fun loginCustomer(emailOrPhone: String, password: String): Result<UserProfile> {
        if (emailOrPhone.isBlank() || password.length < 4) {
            return Result.failure(Exception("Please enter valid credentials."))
        }
        val user = UserProfile(
            uid = "u_${UUID.randomUUID().toString().take(8)}",
            fullName = emailOrPhone.substringBefore("@").replaceFirstChar { it.uppercase() },
            email = if (emailOrPhone.contains("@")) emailOrPhone else "$emailOrPhone@buyjump.com",
            phone = if (!emailOrPhone.contains("@")) emailOrPhone else "+94 77 123 4567",
            role = UserRole.USER
        )
        currentUser.update(user)
        isGuest.update(false)
        return Result.success(user)
    }
}
