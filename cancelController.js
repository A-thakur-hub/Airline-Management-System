// Import required modules and schemas
import Booking from "../models/bookingSchema.js";
import User from "../models/userSchema.js";
import Flight from "../models/flightSchema.js";
import Stripe from "stripe";
import Airline from "../models/airlineSchema.js";
import Ticket from "../models/ticketSchema.js";

export const cancelTicket = async (req, res) => {
    console.log("sneh1", req.userId)
    try {
        const user = await User.findById(req.userId);
        const ticket = await Ticket.findOne({ uid: req.params.flightId });
        const booking = await Booking.findOne({ user: user._id })
        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: "Ticket not found" });
        }


        try {
            // delete from tickets collection
            console.log("sneh==>", ticket)
            const deletedTicket = await Ticket.deleteOne({ _id: ticket._id });;

            if (!deletedTicket) {
                return res.status(404).json({ success: false, message: "Ticket not found" });
            }

            // Remove the deleted booking ID from the associated ticket
            let deletedBooking = await Booking.deleteOne({ _id: booking._id });;

            if (!deletedBooking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            // ticket.tickets = ticket.tickets.filter(ticketID => ticketID.toString() !== bookingID);

            // Remove the deleted booking ID from the associated user

            const removeUserTicket = await User.updateOne({ _id: user._id }, { $pull: { bookings: ticket._id } });
            // let user = await User.findById(deletedBooking.user);

            if (!removeUserTicket) {
                return res.status(404).json({ success: false, message: "Ticket not removed from Users" });
            }

            // user.bookings = user.bookings.filter(ticketID => ticketID.toString() !== ticket._id.toString());

            // Update the booked seats for the flight
            // const flight = await Flight.findById(deletedBooking.flight);

            // if (!flight) {
            //     return res.status(404).json({ success: false, message: "Flight not found" });
            // }

            // flight.bookedSeats = flight.bookedSeats.filter(seat => !selectedSeats.includes(seat));

            // Save the changes
            // await Promise.all([ticket.save()]);

            res.status(200).json({ success: true, message: "Ticket deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }


    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Function to generate a UID
function generateUID() {
    // Generate a random alphanumeric string
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let uid = "";
    for (let i = 0; i < 10; i++) {
        uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
}
