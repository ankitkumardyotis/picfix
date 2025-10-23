import React, { useState, useEffect } from 'react';
import { FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

const LocationAnalytics = () => {
    const [locationData, setLocationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLocationAnalytics();
    }, []);

    const fetchLocationAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/analytics');
            if (!response.ok) {
                throw new Error('Failed to fetch location analytics');
            }
            const data = await response.json();
            setLocationData(data.locationAnalytics || []);
        } catch (error) {
            console.error('Error fetching location analytics:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Loading location analytics...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(58, 28, 113, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: '#ef4444',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    Error loading location analytics: {error}
                </div>
            </div>
        );
    }

    const totalGenerations = locationData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(58, 28, 113, 0.1)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    marginRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FaGlobe style={{ color: 'white', fontSize: '1.25rem' }} />
                </div>
                <div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: 0,
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        User Locations
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Image generations by country (Last 6 months)
                    </p>
                </div>
            </div>

            {/* Statistics Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: '12px'
                }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        {locationData.length}
                    </div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Countries
                    </div>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    borderRadius: '12px'
                }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        {totalGenerations.toLocaleString()}
                    </div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontFamily: 'Roboto, sans-serif'
                    }}>
                        Total Generations
                    </div>
                </div>
            </div>

            {/* Location List */}
            {locationData.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {locationData.map((location, index) => (
                        <div
                            key={`${location.countryCode}-${index}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                marginBottom: '0.75rem',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f3f4f6';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#f9fafb';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: location.color,
                                    marginRight: '1rem',
                                    flexShrink: 0
                                }} />
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FaMapMarkerAlt style={{
                                        color: '#6b7280',
                                        marginRight: '0.5rem',
                                        fontSize: '0.875rem'
                                    }} />
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {location.country}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            fontFamily: 'Roboto, sans-serif'
                                        }}>
                                            {location.countryCode}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {location.count.toLocaleString()}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    fontFamily: 'Roboto, sans-serif'
                                }}>
                                    {location.percentage}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                    fontFamily: 'Roboto, sans-serif'
                }}>
                    <FaGlobe style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                    <div>No location data available yet</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Location data will appear as users generate images
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationAnalytics;
