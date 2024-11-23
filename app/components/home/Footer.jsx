import React from 'react'

function Footer() {
  return (
    <footer className="w-full bg-secondary mt-auto">
      <div className="container mx-auto py-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; NanoClip 2024. Built by{" "}
          <a
            href="https://github.com/nanadotam"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Nana Amoako
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer