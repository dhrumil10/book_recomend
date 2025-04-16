// Register.jsx
// Register.jsx - First few lines with fixed import
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Using the named export
import { Book, ArrowLeft, ChevronRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    age: '',
    profession: '',
    relationshipStatus: 'Single',
    hobbies: '',
    activityLevel: 'Medium',
    city: '',
    state: '',
    country: '',
    genrePreferences: [],
    authorPreferences: [],
    themePreferences: [],
    readingEnvironment: 'home, cafe',
    readingTime: 'evening, weekend',
    formatPreference: 'physical',
    readingDuration: '45min'
  });
  
  // Available options for selection fields
  const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed'];
  const activityLevelOptions = ['Low', 'Medium', 'High'];
  const formatOptions = ['physical', 'ebook', 'audiobook'];
  
  // Sample genres, authors, and themes for the form
  const availableGenres = [
    'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 
    'Historical Fiction', 'Literary Fiction', 'Biography', 'Self-help', 
    'Horror', 'Adventure', 'Classic', 'Young Adult', 'Dystopian', 'Satire'
  ];
  
  const availableAuthors = [
    'Jane Austen', 'George Orwell', 'Toni Morrison', 'Gabriel García Márquez', 
    'Haruki Murakami', 'Margaret Atwood', 'Chimamanda Ngozi Adichie', 
    'Neil Gaiman', 'Isabel Allende', 'Kazuo Ishiguro', 'Stephen King',
    'J.K. Rowling', 'Ernest Hemingway', 'Virginia Woolf', 'Franz Kafka'
  ];
  
  const availableThemes = [
    'Coming of Age', 'Love and Redemption', 'Man vs. Nature', 'Good vs. Evil', 
    'Power and Corruption', 'Identity and Self-Discovery', 'Alienation and Loneliness', 
    'Family Dynamics', 'Fate vs. Free Will', 'Justice and Revenge',
    'Technology and Humanity', 'Social Justice', 'Mortality and Death',
    'Friendship and Loyalty', 'Freedom and Oppression'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox items (multi-select)
  const handleCheckboxChange = (field, item) => {
    setFormData(prev => {
      const currentItems = prev[field] || [];
      if (currentItems.includes(item)) {
        return { ...prev, [field]: currentItems.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...currentItems, item] };
      }
    });
  };
  
  // Move to the next step
  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.email || !formData.name) {
        setError('Email and full name are required');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
    setError('');
  };
  
  // Move to the previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setIsLoading(true);
      
      await register(formData);
      navigate('/'); // Redirect to home page after registration
    } catch (error) {
      setError('Registration failed: ' + error.message);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render step 1: Basic Info
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email Address*
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your email address"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Full Name*
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your full name"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="First name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Last name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="13"
            max="120"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Your age"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profession
          </label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Your profession"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Relationship Status
          </label>
          <select
            name="relationshipStatus"
            value={formData.relationshipStatus}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {relationshipOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Activity Level
          </label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {activityLevelOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Hobbies
        </label>
        <input
          type="text"
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your hobbies (comma separated)"
        />
      </div>
    </div>
  );
  
  // Render step 2: Location Info
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Location Information</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          City
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your city"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          State/Province
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your state or province"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Country
        </label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Your country"
        />
      </div>
    </div>
  );
  
  // Render step 3: Reading Preferences
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reading Preferences</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Favorite Genres (select up to 5)
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableGenres.map(genre => (
            <div key={genre} className="flex items-center">
              <input
                type="checkbox"
                id={`genre-${genre}`}
                checked={formData.genrePreferences.includes(genre)}
                onChange={() => handleCheckboxChange('genrePreferences', genre)}
                className="mr-2"
                disabled={formData.genrePreferences.length >= 5 && !formData.genrePreferences.includes(genre)}
              />
              <label htmlFor={`genre-${genre}`} className="text-sm">{genre}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Favorite Authors (select up to 5)
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableAuthors.map(author => (
            <div key={author} className="flex items-center">
              <input
                type="checkbox"
                id={`author-${author}`}
                checked={formData.authorPreferences.includes(author)}
                onChange={() => handleCheckboxChange('authorPreferences', author)}
                className="mr-2"
                disabled={formData.authorPreferences.length >= 5 && !formData.authorPreferences.includes(author)}
              />
              <label htmlFor={`author-${author}`} className="text-sm">{author}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Favorite Themes (select up to 5)
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableThemes.map(theme => (
            <div key={theme} className="flex items-center">
              <input
                type="checkbox"
                id={`theme-${theme}`}
                checked={formData.themePreferences.includes(theme)}
                onChange={() => handleCheckboxChange('themePreferences', theme)}
                className="mr-2"
                disabled={formData.themePreferences.length >= 5 && !formData.themePreferences.includes(theme)}
              />
              <label htmlFor={`theme-${theme}`} className="text-sm">{theme}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render step 4: Reading Habits
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reading Habits</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Preferred Reading Environment
        </label>
        <input
          type="text"
          name="readingEnvironment"
          value={formData.readingEnvironment}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="e.g., home, cafe, commute (comma separated)"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Preferred Reading Time
        </label>
        <input
          type="text"
          name="readingTime"
          value={formData.readingTime}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="e.g., morning, evening, weekend (comma separated)"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Preferred Format
        </label>
        <div className="flex space-x-4">
          {formatOptions.map(format => (
            <div key={format} className="flex items-center">
              <input
                type="radio"
                id={`format-${format}`}
                name="formatPreference"
                value={format}
                checked={formData.formatPreference === format}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor={`format-${format}`} className="text-sm capitalize">{format}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Reading Session Duration
        </label>
        <select
          name="readingDuration"
          value={formData.readingDuration}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="15min">About 15 minutes</option>
          <option value="30min">About 30 minutes</option>
          <option value="45min">About 45 minutes</option>
          <option value="60min">About 1 hour</option>
          <option value="90min">About 1.5 hours</option>
          <option value="120min">About 2 hours or more</option>
        </select>
      </div>
    </div>
  );
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col p-6">
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
              <Book className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create Your BookLovers Account</h1>
            <p className="text-gray-600 mt-2">Step {currentStep} of 4</p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;