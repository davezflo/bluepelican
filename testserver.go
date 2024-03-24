package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"path/filepath"
)

func serveFileWithMimeType(w http.ResponseWriter, r *http.Request, filename string) {
	// Set the Content-Type based on the file extension
	ext := filepath.Ext(filename)
	mimeType := mime.TypeByExtension(ext)
	if mimeType != "" {
		w.Header().Set("Content-Type", mimeType)
	}
	fmt.Println(filename)
	http.ServeFile(w, r, filename)
}

func math(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./maths.js")
}
func projection(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./projections.js")
}
func shape(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./shapes.js")
}
func setup(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./setup.js")
}
func threadpointinterface(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./threadpointinterface.js")
}
func threadpoint(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./threadpoint.js")
}
func visualengine(w http.ResponseWriter, r *http.Request) {
	serveFileWithMimeType(w, r, "./visualengine.js")
}
func hello(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./helloworld.js")
}

func test(w http.ResponseWriter, r *http.Request) {
	buf, _ := ioutil.ReadFile("./test.htm")
	fmt.Fprintf(w, string(buf))
}

func logRequest(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println((r.URL.Path))
		log.Printf("Requested URL: %s", r.URL.Path)
		handler(w, r)
	}
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	http.HandleFunc("/maths", math)
	http.HandleFunc("/projections", projection)
	http.HandleFunc("/shapes", shape)
	http.HandleFunc("/setup", setup)
	http.HandleFunc("/visualengine", visualengine)
	http.HandleFunc("/", logRequest(test))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
