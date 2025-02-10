import React, { useState, useEffect } from "react";
import "./ParkingLog.css";

const ParkingLog = () => {
  // State to store parking events
  const [parkingEvents, setParkingEvents] = useState([]);

  // Simulate real-time data fetching
  useEffect(() => {
    const fetchParkingEvents = () => {
      // Mock data for demonstration
      const mockData = [
        {
          eventId: 1,
          lotId: "LOT001",
          userId: "USER123",
          entryTime: "2023-10-01 10:00:00",
          exitTime: "2023-10-01 12:00:00",
          isPrivate: false,
        },
        {
          eventId: 2,
          lotId: "LOT002",
          userId: "USER456",
          entryTime: "2023-10-01 11:30:00",
          exitTime: "2023-10-01 14:00:00",
          isPrivate: true,
        },
        {
          eventId: 3,
          lotId: "LOT001",
          userId: "USER789",
          entryTime: "2023-10-01 13:00:00",
          exitTime: "N/A",
          isPrivate: false,
        },
      ];

      // Update the state with new data
      setParkingEvents(mockData);
    };

    // Fetch data initially
    fetchParkingEvents();

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(fetchParkingEvents, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="parking-log-container">
      <h1 className="parking-log-title">Parking Log</h1>
      <p className="parking-log-description">
        Real-time notifications for parking events.
      </p>
      <div className="parking-log-table-container">
        <table className="parking-log-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Lot ID</th>
              <th>User ID</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Private</th>
            </tr>
          </thead>
          <tbody>
            {parkingEvents.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventId}</td>
                <td>{event.lotId}</td>
                <td>{event.userId}</td>
                <td>{event.entryTime}</td>
                <td>{event.exitTime}</td>
                <td>
                  <span
                    className={`private-status ${
                      event.isPrivate ? "private" : "public"
                    }`}
                  >
                    {event.isPrivate ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParkingLog;