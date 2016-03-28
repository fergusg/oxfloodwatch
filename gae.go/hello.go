package hello

import (
    "fmt"
    "net/http"
    "appengine"
)

func init() {
    http.HandleFunc("/", handler)
    http.HandleFunc("/x", xhandler)
}

func handler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
    fmt.Fprint(w, "Hello, strange world!", c)
}

func xhandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello, x!")
}
