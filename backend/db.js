import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	query,
	setDoc,
	updateDoc,
	where,
	orderBy,
} from 'firebase/firestore'
import { db } from './firebase.js'

const usersCollectionName = 'users'
const productsCollectionName = 'products'
const contactInfoCollectionName = 'contactInfo'
const sliderContentCollectionName = 'sliderContent'
const contactRequestsCollectionName = 'contactRequests'
const validProductStatuses = ['in-stock', 'coming-soon', 'out-of-stock']

function toDateOrValue(value) {
	if (value && typeof value.toDate === 'function') {
		return value.toDate()
	}

	return value ?? null
}

function normalizeDocument(snapshot) {
	if (!snapshot?.exists()) {
		return null
	}

	return {
		_id: snapshot.id,
		...snapshot.data(),
	}
}

function normalizeDocuments(snapshot) {
	return snapshot.docs.map((item) => ({
		_id: item.id,
		...item.data(),
	}))
}

function ensureValidId(id, errorMessage) {
	if (!id || typeof id !== 'string' || !id.trim()) {
		throw new Error(errorMessage)
	}
}

export async function getUsersCollection() {
	return collection(db, usersCollectionName)
}

export async function getProductsCollection() {
	return collection(db, productsCollectionName)
}

export async function getContactInfoCollection() {
	return collection(db, contactInfoCollectionName)
}

export async function getSliderContentCollection() {
	return collection(db, sliderContentCollectionName)
}

export async function getContactRequestsCollection() {
	return collection(db, contactRequestsCollectionName)
}

export function toSafeProduct(product) {
	if (!product) {
		return null
	}

	return {
		_id: product._id,
		productId: product.productId,
		name: product.name,
		category: product.category,
		description: product.description,
		price: product.price,
		height: product.height,
		width: product.width,
		unit: product.unit,
		status: product.status,
		imageUrls: product.imageUrls || [],
		createdAt: toDateOrValue(product.createdAt),
		updatedAt: toDateOrValue(product.updatedAt),
	}
}

export function toSafeUser(user) {
	if (!user) {
		return null
	}

	return {
		_id: user._id,
		username: user.username,
		role: user.role,
		for: user.for,
	}
}

export function toSafeContactInfo(contactInfo) {
	if (!contactInfo) {
		return null
	}

	return {
		_id: contactInfo._id,
		mobileNumber: contactInfo.mobileNumber,
		email: contactInfo.email,
		address: contactInfo.address,
		createdAt: toDateOrValue(contactInfo.createdAt),
		updatedAt: toDateOrValue(contactInfo.updatedAt),
	}
}

export function toSafeSliderContent(sliderContent) {
	if (!sliderContent) {
		return null
	}

	return {
		_id: sliderContent._id,
		title: sliderContent.title,
		description: sliderContent.description,
		createdAt: toDateOrValue(sliderContent.createdAt),
		updatedAt: toDateOrValue(sliderContent.updatedAt),
	}
}

export function toSafeContactRequest(contactRequest) {
	if (!contactRequest) {
		return null
	}

	return {
		_id: contactRequest._id,
		name: contactRequest.name,
		phone: contactRequest.phone,
		message: contactRequest.message,
		createdAt: toDateOrValue(contactRequest.createdAt),
		updatedAt: toDateOrValue(contactRequest.updatedAt),
	}
}

export async function getAllUsers() {
	const usersRef = await getUsersCollection()
	const usersSnapshot = await getDocs(usersRef)
	return normalizeDocuments(usersSnapshot).map(toSafeUser)
}

export async function findUserByCredentials(username, password) {
	const usersRef = await getUsersCollection()
	const usersQuery = query(usersRef, where('username', '==', username), where('password', '==', password), limit(1))
	const usersSnapshot = await getDocs(usersQuery)
	const user = usersSnapshot.empty
		? null
		: { _id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() }

	return toSafeUser(user)
}

export async function createUser(userData) {
	const usersRef = await getUsersCollection()
	const username = userData.username?.trim()
	const password = userData.password?.trim()
	const role = userData.role?.trim()
	const forName = userData.for?.trim()

	if (!username || !password || !role || !forName) {
		throw new Error('Username, password, role, and for are required.')
	}

	const duplicateQuery = query(usersRef, where('username', '==', username), limit(1))
	const duplicateSnapshot = await getDocs(duplicateQuery)

	if (!duplicateSnapshot.empty) {
		const error = new Error('A user with that username already exists.')
		error.code = 'DUPLICATE_USERNAME'
		throw error
	}

	const result = await addDoc(usersRef, {
		username,
		password,
		role,
		for: forName,
	})

	return toSafeUser({
		_id: result.id,
		username,
		role,
		for: forName,
	})
}

export async function deleteUserById(userId) {
	ensureValidId(userId, 'Invalid user id.')
	const userRef = doc(db, usersCollectionName, userId)
	const existingUser = await getDoc(userRef)

	if (!existingUser.exists()) {
		return false
	}

	await deleteDoc(userRef)
	return true
}

export async function getContactInfo() {
	const contactInfoRef = await getContactInfoCollection()
	const contactInfoQuery = query(contactInfoRef, orderBy('updatedAt', 'desc'), orderBy('createdAt', 'desc'), limit(1))
	const contactInfoSnapshot = await getDocs(contactInfoQuery)

	if (contactInfoSnapshot.empty) {
		return null
	}

	return normalizeDocument(contactInfoSnapshot.docs[0])
}

export async function upsertContactInfo(contactInfoData) {
	const contactInfoRef = await getContactInfoCollection()
	const mobileNumber = contactInfoData.mobileNumber?.trim()
	const email = contactInfoData.email?.trim()
	const address = String(contactInfoData.address ?? '')

	if (!mobileNumber || !email || !address.trim()) {
		throw new Error('Mobile number, email, and address are required.')
	}

	const existingContactInfo = await getContactInfo()
	const now = new Date()
	const documentData = {
		mobileNumber,
		email,
		address,
		createdAt: existingContactInfo?.createdAt || now,
		updatedAt: now,
	}

	if (existingContactInfo) {
		const existingRef = doc(db, contactInfoCollectionName, existingContactInfo._id)
		await setDoc(existingRef, documentData)

		return toSafeContactInfo({
			_id: existingContactInfo._id,
			...documentData,
		})
	}

	const result = await addDoc(contactInfoRef, documentData)

	return toSafeContactInfo({
		_id: result.id,
		...documentData,
	})
}

export async function getAllSliderContent() {
	const sliderContentRef = await getSliderContentCollection()
	const sliderContentQuery = query(sliderContentRef, orderBy('createdAt', 'desc'))
	const sliderContentSnapshot = await getDocs(sliderContentQuery)
	return normalizeDocuments(sliderContentSnapshot).map(toSafeSliderContent)
}

export async function getAllContactRequests() {
	const contactRequestsRef = await getContactRequestsCollection()
	const contactRequestsQuery = query(contactRequestsRef, orderBy('createdAt', 'desc'))
	const requestsSnapshot = await getDocs(contactRequestsQuery)
	return normalizeDocuments(requestsSnapshot).map(toSafeContactRequest)
}

export async function createContactRequest(requestData) {
	const contactRequestsRef = await getContactRequestsCollection()
	const name = requestData.name?.trim()
	const phone = requestData.phone?.trim()
	const message = requestData.message?.trim()

	if (!name || !phone || !message) {
		throw new Error('Name, phone, and message are required.')
	}

	const now = new Date()
	const documentData = {
		name,
		phone,
		message,
		createdAt: now,
		updatedAt: now,
	}

	const result = await addDoc(contactRequestsRef, documentData)

	return toSafeContactRequest({
		_id: result.id,
		...documentData,
	})
}

export async function deleteContactRequestById(requestId) {
	ensureValidId(requestId, 'Invalid contact request id.')
	const requestRef = doc(db, contactRequestsCollectionName, requestId)
	const existingRequest = await getDoc(requestRef)

	if (!existingRequest.exists()) {
		return false
	}

	await deleteDoc(requestRef)
	return true
}

export async function createSliderContent(sliderContentData) {
	const sliderContentRef = await getSliderContentCollection()
	const title = sliderContentData.title?.trim()
	const description = sliderContentData.description?.trim()

	if (!title || !description) {
		throw new Error('Title and description are required.')
	}

	const documentData = {
		title,
		description,
		createdAt: new Date(),
	}

	const result = await addDoc(sliderContentRef, documentData)

	return toSafeSliderContent({
		_id: result.id,
		...documentData,
	})
}

export async function updateSliderContentById(sliderContentId, sliderContentData) {
	ensureValidId(sliderContentId, 'Invalid slider content id.')
	const sliderContentRef = doc(db, sliderContentCollectionName, sliderContentId)
	const existingSnapshot = await getDoc(sliderContentRef)

	if (!existingSnapshot.exists()) {
		return null
	}

	const existingSliderContent = normalizeDocument(existingSnapshot)
	const title = sliderContentData.title?.trim()
	const description = sliderContentData.description?.trim()

	if (!title || !description) {
		throw new Error('Title and description are required.')
	}

	const updatedDocument = {
		title,
		description,
		createdAt: toDateOrValue(existingSliderContent.createdAt) || new Date(),
		updatedAt: new Date(),
	}

	await updateDoc(sliderContentRef, updatedDocument)

	return toSafeSliderContent({
		_id: existingSliderContent._id,
		...updatedDocument,
	})
}

export async function deleteSliderContentById(sliderContentId) {
	ensureValidId(sliderContentId, 'Invalid slider content id.')
	const sliderContentRef = doc(db, sliderContentCollectionName, sliderContentId)
	const existingSliderContent = await getDoc(sliderContentRef)

	if (!existingSliderContent.exists()) {
		return false
	}

	await deleteDoc(sliderContentRef)
	return true
}

export async function createProduct(productData) {
	const productsRef = await getProductsCollection()
	const productId = Number.parseInt(productData.productId, 10)
	const name = productData.name?.trim()
	const category = productData.category?.trim()
	const description = productData.description?.trim()
	const price = Number.parseFloat(productData.price)
	const height = Number.parseFloat(productData.height)
	const width = Number.parseFloat(productData.width)
	const unit = productData.unit?.trim()
	const status = productData.status?.trim()
	const imageUrls = Array.isArray(productData.imageUrls) ? productData.imageUrls.filter(Boolean) : []

	if (!Number.isInteger(productId)) {
		throw new Error('Product ID must be an integer.')
	}

	if (!name || !category || !description || !Number.isFinite(price) || !Number.isFinite(height) || !Number.isFinite(width) || !unit || !status) {
		throw new Error('All product fields are required.')
	}

	if (!['inch', 'cm'].includes(unit)) {
		throw new Error('Unit must be inch or cm.')
	}

	if (!validProductStatuses.includes(status)) {
		throw new Error('Status must be in-stock, coming-soon, or out-of-stock.')
	}

	// if (imageUrls.length !== 3) {
	// 	throw new Error('Three product images are required.')
	// }
	if (!Array.isArray(imageUrls)) {
    	throw new Error('Image URLs must be an array.')
	}

	const duplicateQuery = query(productsRef, where('productId', '==', productId), limit(1))
	const duplicateSnapshot = await getDocs(duplicateQuery)

	if (!duplicateSnapshot.empty) {
		const error = new Error('A product with that product ID already exists.')
		error.code = 'DUPLICATE_PRODUCT_ID'
		throw error
	}

	const documentData = {
		productId,
		name,
		category,
		description,
		price,
		height,
		width,
		unit,
		status,
		imageUrls,
		createdAt: new Date(),
	}

	const result = await addDoc(productsRef, documentData)

	return toSafeProduct({
		_id: result.id,
		...documentData,
	})
}

export async function getAllProducts() {
	const productsRef = await getProductsCollection()
	const productsQuery = query(productsRef, orderBy('createdAt', 'desc'))
	const productsSnapshot = await getDocs(productsQuery)
	return normalizeDocuments(productsSnapshot).map(toSafeProduct)
}

export async function getProductById(productId) {
	ensureValidId(productId, 'Invalid product id.')
	const productRef = doc(db, productsCollectionName, productId)
	const productSnapshot = await getDoc(productRef)
	return normalizeDocument(productSnapshot)
}

export async function updateProductById(productId, productData) {
	ensureValidId(productId, 'Invalid product id.')
	const productsRef = await getProductsCollection()
	const productRef = doc(db, productsCollectionName, productId)
	const existingSnapshot = await getDoc(productRef)

	if (!existingSnapshot.exists()) {
		return null
	}

	const existingProduct = normalizeDocument(existingSnapshot)
	const nextProductId = Number.parseInt(productData.productId, 10)
	const name = productData.name?.trim()
	const category = productData.category?.trim()
	const description = productData.description?.trim()
	const price = Number.parseFloat(productData.price)
	const height = Number.parseFloat(productData.height)
	const width = Number.parseFloat(productData.width)
	const unit = productData.unit?.trim()
	const status = productData.status?.trim()
	const imageUrls = Array.isArray(productData.imageUrls) ? productData.imageUrls.filter(Boolean) : []

	if (!Number.isInteger(nextProductId)) {
		throw new Error('Product ID must be an integer.')
	}

	if (!name || !category || !description || !Number.isFinite(price) || !Number.isFinite(height) || !Number.isFinite(width) || !unit || !status) {
		throw new Error('All product fields are required.')
	}

	if (!['inch', 'cm'].includes(unit)) {
		throw new Error('Unit must be inch or cm.')
	}

	if (!validProductStatuses.includes(status)) {
		throw new Error('Status must be in-stock, coming-soon, or out-of-stock.')
	}

	// if (imageUrls.length !== 3) {
	// 	throw new Error('Three product images are required.')
	// }
	if (!Array.isArray(imageUrls)) {
    	throw new Error('Image URLs must be an array.')
	}

	const duplicateQuery = query(productsRef, where('productId', '==', nextProductId))
	const duplicateSnapshot = await getDocs(duplicateQuery)
	const hasDuplicate = duplicateSnapshot.docs.some((snapshot) => snapshot.id !== existingProduct._id)

	if (hasDuplicate) {
		const error = new Error('A product with that product ID already exists.')
		error.code = 'DUPLICATE_PRODUCT_ID'
		throw error
	}

	const updatedDocument = {
		productId: nextProductId,
		name,
		category,
		description,
		price,
		height,
		width,
		unit,
		status,
		imageUrls,
		createdAt: toDateOrValue(existingProduct.createdAt) || new Date(),
		updatedAt: new Date(),
	}

	await updateDoc(productRef, updatedDocument)

	return toSafeProduct({
		_id: existingProduct._id,
		...updatedDocument,
	})
}

export async function deleteProductById(productId) {
	ensureValidId(productId, 'Invalid product id.')
	const productRef = doc(db, productsCollectionName, productId)
	const existingProduct = await getDoc(productRef)

	if (!existingProduct.exists()) {
		return false
	}

	await deleteDoc(productRef)
	return true
}
