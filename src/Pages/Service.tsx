import { Phone, Mail, MapPin, Navigation, Wrench, Star } from 'lucide-react';

export default function Service() {
  const serviceCenters = [
    {
      id: 1,
      name: 'SOLEDGE Solar Solutions',
      address: 'MG Road, Kochi, Kerala 682016',
      phone: '+91 98765 43210',
      email: 'kochi@soledge.com',
      distance: '2.5 km',
      rating: 4.8,
      services: ['Installation', 'Maintenance', 'Repair'],
    },
    {
      id: 2,
      name: 'SunPower Service Center',
      address: 'Edappally, Kochi, Kerala 682024',
      phone: '+91 98765 43211',
      email: 'edappally@sunpower.com',
      distance: '5.2 km',
      rating: 4.6,
      services: ['Installation', 'Maintenance', 'Emergency'],
    },
    {
      id: 3,
      name: 'Green Energy Solutions',
      address: 'Palarivattom, Kochi, Kerala 682025',
      phone: '+91 98765 43212',
      email: 'info@greenenergy.com',
      distance: '6.8 km',
      rating: 4.7,
      services: ['Repair', 'Maintenance', 'Consultation'],
    },
    {
      id: 4,
      name: 'Solar Tech Pro',
      address: 'Kakkanad, Kochi, Kerala 682030',
      phone: '+91 98765 43213',
      email: 'support@solartechpro.com',
      distance: '8.1 km',
      rating: 4.5,
      services: ['Installation', 'Repair', 'Warranty'],
    },
    {
      id: 5,
      name: 'Eco Solar Services',
      address: 'Aluva, Ernakulam, Kerala 683101',
      phone: '+91 98765 43214',
      email: 'contact@ecosolar.com',
      distance: '12.3 km',
      rating: 4.4,
      services: ['Maintenance', 'Repair', 'Inspection'],
    },
    {
      id: 6,
      name: 'Bright Solar Hub',
      address: 'Thrippunithura, Kochi, Kerala 682301',
      phone: '+91 98765 43215',
      email: 'hello@brightsolar.com',
      distance: '9.5 km',
      rating: 4.6,
      services: ['Installation', 'Emergency', 'Consultation'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Wrench className="w-10 h-10 text-orange-600" />
            Nearby Service Centers
          </h1>
          <p className="text-gray-600 text-lg">
            Find authorized solar service centers near you
          </p>
        </div>

        {/* Service Centers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {serviceCenters.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {center.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {center.rating}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm font-medium">{center.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{center.address}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${center.phone}`}
                    className="text-sm text-gray-900 font-medium hover:text-blue-600 transition-colors"
                  >
                    {center.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${center.email}`}
                    className="text-sm text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {center.email}
                  </a>
                </div>
              </div>

              {/* Services Offered */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  SERVICES OFFERED
                </p>
                <div className="flex flex-wrap gap-2">
                  {center.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <a
                  href={`tel:${center.phone}`}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    center.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-700 mb-4">
            Contact our customer support team for assistance in finding the right service center for your needs.
          </p>
          <a
            href="tel:+911800123456"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            1800-123-456 (Toll Free)
          </a>
        </div>
      </div>
    </div>
  );
}