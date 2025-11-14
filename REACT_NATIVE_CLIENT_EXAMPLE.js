// SAMPLE CODE FOR REACT NATIVE CLIENT
// Use this as a reference to implement image uploads in your React Native app

// Example 1: Simple Product Upload with Images
// ==================================================

const uploadProductWithImages = async (productData, imageUris) => {
  try {
    const formData = new FormData();

    // Add image files
    if (imageUris && imageUris.length > 0) {
      imageUris.forEach((imageUri, index) => {
        // Create a file object from the image URI
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg', // Change based on actual image type
          name: `product-image-${index}-${Date.now()}.jpg`
        });
      });
    }

    // Add product data as JSON string
    formData.append('productData', JSON.stringify(productData));

    // Send to server
    const response = await fetch('http://your-server-ip:5000/products', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - FormData will handle it
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Product created successfully:', result.product);
      return result.product;
    } else {
      throw new Error(result.message || 'Failed to upload product');
    }

  } catch (error) {
    console.error('Error uploading product:', error);
    throw error;
  }
};


// Example 2: Using React Navigation with Image Picker
// ==================================================

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

const AddProductScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: true,
        quality: 0.8,
      });

      if (!result.cancelled) {
        setImages(result.assets.map(asset => asset.uri));
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const handleSubmit = async () => {
    if (!productName || !price || images.length === 0) {
      alert('Please fill all fields and select images');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: productName,
        price: parseFloat(price),
        description: 'Product description',
        category: 'General',
      };

      const uploadedProduct = await uploadProductWithImages(productData, images);
      
      // Reset form
      setProductName('');
      setPrice('');
      setImages([]);
      
      alert('Product uploaded successfully!');
      navigation.goBack();

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      
      <TouchableOpacity onPress={pickImages}>
        <Text>Pick Images ({images.length})</Text>
      </TouchableOpacity>

      {/* Display selected images */}
      <ScrollView horizontal>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={{ width: 100, height: 100 }} />
        ))}
      </ScrollView>

      <TouchableOpacity onPress={handleSubmit} disabled={loading}>
        <Text>{loading ? 'Uploading...' : 'Upload Product'}</Text>
      </TouchableOpacity>
    </View>
  );
};


// Example 3: Handling Image URLs After Upload
// ==================================================

const fetchAndDisplayProducts = async () => {
  try {
    const response = await fetch('http://your-server-ip:5000/products');
    const products = await response.json();
    
    // Images now contain web URLs instead of local paths
    products.forEach(product => {
      console.log('Product:', product.name);
      console.log('Images:', product.images); // Array of URLs
      
      // Use URLs in Image component
      product.images.forEach(imageUrl => {
        console.log('Image URL:', imageUrl);
        // <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />
      });
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};


// Example 4: Complete Product Object Structure
// ==================================================

const exampleProduct = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Samsung Galaxy S21',
  price: 799.99,
  description: 'Flagship smartphone',
  category: 'Electronics',
  images: [
    'http://192.168.1.100:5000/uploads/1699999999999-123456789.jpg',
    'http://192.168.1.100:5000/uploads/1700000000000-987654321.png'
  ],
  createdAt: '2024-11-14T10:30:00.000Z'
};


// Example 5: Error Handling Best Practices
// ==================================================

const uploadWithErrorHandling = async (productData, imageUris) => {
  try {
    const formData = new FormData();

    // Validate inputs
    if (!productData || !imageUris || imageUris.length === 0) {
      throw new Error('Product data and at least one image are required');
    }

    // Add images with validation
    imageUris.forEach((uri, index) => {
      if (!uri) {
        throw new Error(`Invalid image URI at index ${index}`);
      }
      formData.append('images', {
        uri: uri,
        type: 'image/jpeg',
        name: `product-${index}.jpg`
      });
    });

    formData.append('productData', JSON.stringify(productData));

    const response = await fetch('http://your-server-ip:5000/products', {
      method: 'POST',
      body: formData,
      timeout: 30000, // 30 seconds timeout
    });

    const result = await response.json();

    if (!result.success) {
      // Handle specific error types
      if (result.error.includes('image files')) {
        throw new Error('Only image files are allowed');
      } else if (result.error.includes('too large')) {
        throw new Error('Images must be less than 10MB');
      } else {
        throw new Error(result.error || result.message);
      }
    }

    return result.product;

  } catch (error) {
    console.error('Upload error:', error.message);
    
    // Re-throw with user-friendly message
    throw {
      title: 'Upload Failed',
      message: error.message || 'Failed to upload product. Please try again.',
      originalError: error
    };
  }
};


// Key Points for Implementation:
// ==============================
// 1. Always use FormData for multipart requests with files
// 2. Don't set Content-Type header - let fetch/FormData handle it
// 3. Pass product data as JSON string in the 'productData' field
// 4. Validate images before uploading
// 5. Handle both success and error responses
// 6. Store returned image URLs, not local paths
// 7. Use the URLs when displaying or sharing products
// 8. Handle timeout and network errors gracefully
