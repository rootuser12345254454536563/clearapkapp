import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase/config';

export interface FirestoreProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  imageUrl: string;
  status: 'active' | 'draft' | 'hidden' | 'out_of_stock';
  variants?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  imageUrl?: string;
  sellerId?: string;
}

export interface FirestoreOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sellerId?: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

export async function uploadImageToStorage(file: File, folder: string = 'products'): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storageRef = ref(storage, `${folder}/${cleanName}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return downloadURL;
  } catch (error) {
    console.warn('Firebase Storage upload failed or not enabled yet:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

export async function createProductInFirestore(
  productData: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const productRef = doc(db, 'products', newId);

  const payload: FirestoreProduct = {
    ...productData,
    id: newId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(productRef, payload);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${newId}`);
    return newId;
  }
}

export async function updateProductInFirestore(
  productId: string,
  productData: Partial<FirestoreProduct>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  try {
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const productRef = doc(db, 'products', productId);
  try {
    await deleteDoc(productRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

export async function createOrderInFirestore(
  orderData: Omit<FirestoreOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const orderId = `BJ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderRef = doc(db, 'orders', orderId);

  const payload: FirestoreOrder = {
    ...orderData,
    id: orderId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(orderRef, payload);
    triggerWhatsAppOrderConfirmation(payload).catch(e => console.log('WhatsApp notification status:', e));
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
    return orderId;
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: FirestoreOrder['status'],
  customerPhone?: string,
  customerName?: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  try {
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });

    if (customerPhone) {
      triggerWhatsAppStatusUpdate(orderId, status, customerPhone, customerName).catch(e => console.log('WhatsApp status trigger error:', e));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function triggerWhatsAppOrderConfirmation(order: FirestoreOrder) {
  try {
    const itemsText = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: order.customerPhone,
        type: 'text',
        orderId: order.id,
        textMessage: `🛍️ *BUYJUMP Order Confirmation*\n\nOrder ID: *${order.id}*\nHi ${order.customerName}, thank you for your order!\n\nItems: ${itemsText}\nTotal: Rs. ${order.totalAmount.toLocaleString()}\nPayment: ${order.paymentMethod}\nStatus: ${order.status}\n\nWe will update you as soon as your items are dispatched.`
      })
    });
  } catch (e) {
    console.warn('Could not contact WhatsApp endpoint:', e);
  }
}

export async function triggerWhatsAppStatusUpdate(
  orderId: string,
  newStatus: string,
  customerPhone: string,
  customerName?: string
) {
  try {
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerPhone,
        type: 'text',
        orderId,
        textMessage: `📦 *BUYJUMP Order Update*\n\nOrder ID: *${orderId}*\nHi ${customerName || 'Customer'},\nYour order status has been updated to: *${newStatus.toUpperCase()}*.\n\nThank you for shopping with BUYJUMP!`
      })
    });
  } catch (e) {
    console.warn('Could not trigger WhatsApp update:', e);
  }
}

export async function sendTestWhatsAppMessage(phone: string, text: string) {
  const res = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: phone,
      type: 'text',
      textMessage: text
    })
  });
  return await res.json();
}

export async function getWhatsAppApiStatus() {
  const res = await fetch('/api/whatsapp/status');
  return await res.json();
}

export async function getWhatsAppLogs() {
  const res = await fetch('/api/whatsapp/logs');
  return await res.json();
}
