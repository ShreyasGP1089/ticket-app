package com.example.Final;


import com.example.Final.Model.ticket;
import com.example.Final.Service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class Controller {
    @Autowired
    TicketService service;

    public Controller() {
    }

    @PostMapping({"/ticket"})
    public ResponseEntity<ticket> submitIssue(@RequestBody ticket ticket) {
        return new ResponseEntity(this.service.addticket(ticket), HttpStatus.ACCEPTED);
    }

    // Original non-paginated endpoint (kept for backwards compatibility)
    @GetMapping({"/tickets"})
    public ResponseEntity<List<ticket>> submitIssue() {
        List<ticket> tickets = this.service.gettickets();
        return new ResponseEntity(tickets, HttpStatus.ACCEPTED);
    }

    // New paginated endpoint
    @GetMapping({"/tickets/paginated"})
    public ResponseEntity<Page<ticket>> getTicketsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ticket> ticketsPage = this.service.getTicketsPageable(pageable);
        return new ResponseEntity(ticketsPage, HttpStatus.OK);
    }

    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<String> deleteIssue(@PathVariable("id") Long id) {
        this.service.delete(id);
        return new ResponseEntity("Done", HttpStatus.ACCEPTED);
    }

    @GetMapping({"/ticket-count/category/{category}"})
    public ResponseEntity<List<ticket>> getByCategory(@PathVariable String category) {
        List<ticket> tickets = this.service.findAllcate(category);
        return new ResponseEntity(tickets, HttpStatus.OK);
    }

    @GetMapping({"/ticket-count/status/{status}"})
    public ResponseEntity<List<ticket>> getstatus(@PathVariable String status) {
        List<ticket> tickets = this.service.findAllstatus(status);
        return new ResponseEntity(tickets, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        Optional<ticket> ticketOptional = this.service.getTicketById(id);
        if(ticketOptional.isPresent()){
            return  new ResponseEntity<>((ticket)ticketOptional.get(),HttpStatus.OK);
        }
        else{
            return new ResponseEntity<>("Not found",HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/ticket/{id}"})
    public ResponseEntity<String> resolveTicket(@PathVariable Long id) {
        this.service.update(id);
        return new ResponseEntity("Done", HttpStatus.OK);
    }

    @GetMapping({"/tickets/count"})
    public ResponseEntity<Long> countAll() {
        return new ResponseEntity(this.service.countAllTickets(), HttpStatus.OK);
    }

    @GetMapping({"/tickets/count/resolved"})
    public ResponseEntity<Long> countResolved() {
        return new ResponseEntity(this.service.countByStatus("Resolved"), HttpStatus.OK);
    }

    @GetMapping({"/tickets/count/pending"})
    public ResponseEntity<Long> countPending() {
        return new ResponseEntity(this.service.countByStatus("Open"), HttpStatus.OK);
    }

    @GetMapping({"/tickets/category/{category}"})
    public ResponseEntity<Long> countPending(@PathVariable String category) {
        return new ResponseEntity(this.service.countByCategory(category), HttpStatus.OK);
    }

    @GetMapping("/avgduration")
    public ResponseEntity<String> avgtime(){
        String s=service.getavg();
        return new ResponseEntity<>(s,HttpStatus.OK);
    }

    @PutMapping("/ticket/undo")
    public ResponseEntity<String> undo(@RequestBody Long id) {
        String result = service.undo(id);

        if (result.equals("No ticket")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.ACCEPTED);
        }
    }

}

