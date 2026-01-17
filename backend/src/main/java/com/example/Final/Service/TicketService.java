package com.example.Final.Service;


import com.example.Final.Model.ticket;
import com.example.Final.Repository.TicketRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {
    @Autowired
    TicketRepo ticketRepo;

    public TicketService() {
    }

    public ticket addticket(ticket ticket) {
        ticket.setStatus("Open");
        return (ticket)this.ticketRepo.save(ticket);
    }

    public List<ticket> gettickets() {
        return this.ticketRepo.findAll();
    }

    // Paginated method
    public Page<ticket> getTicketsPageable(Pageable pageable) {
        return this.ticketRepo.findAll(pageable);
    }

    public void delete(Long id) {
        this.ticketRepo.deleteById(id);
    }

    public long countAllTickets() {
        return this.ticketRepo.count();
    }

    public long countByStatus(String status) {
        return this.ticketRepo.countByStatus(status);
    }

    public Optional<ticket> getTicketById(Long id) {
        return ticketRepo.findById(id);
    }

    public List<ticket> findAllcate(String category) {
        return this.ticketRepo.findByCategory(category);
    }


    public List<ticket> findAllstatus(String status) {
        return this.ticketRepo.findByStatus(status);
    }

    public Optional<ticket> findById(Long id) {
        return this.ticketRepo.findById(id);
    }

    public void update(Long id) {
        Optional<ticket> optionalTicket = this.ticketRepo.findById(id);
        if (optionalTicket.isPresent()) {
            ticket t = (ticket)optionalTicket.get();
            t.setStatus("Resolved");
            t.setResolvedAt(LocalDateTime.now());
            this.ticketRepo.save(t);
        } else {
            throw new RuntimeException("Ticket not found with ID: " + id);
        }
    }

    public Long countByCategory(String category) {
        return this.ticketRepo.countByCategory(category);
    }

    public String getavg() {
        double duration=0;
        int count=0;
        List<ticket> tickets=ticketRepo.findByStatus("Resolved");
        for(ticket t:tickets){
            Duration dur= Duration.between(t.getCreatedAt(),t.getResolvedAt());
            duration+=dur.toMinutes();
            count++;
        }
        if(count==0){
            return "0";
        }
        double avg=duration/60.0;
        return String.format("%.1f hrs",avg);
    }

    public String undo(Long id) {
        ticket ticket=ticketRepo.findById(id).orElse(null);
        if(ticket==null){
            return "No ticket";
        }
        ticket.setResolvedAt(null);
        ticket.setStatus("Open");
        ticketRepo.save(ticket);
        return "Done";
    }
}

