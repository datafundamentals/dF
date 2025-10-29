# Loading Web Components into 11ty - by Use Case

**TL;DR:** Your primary goal is high Lighthouse scores(fast loads), and easy to maintain component deployments. How you load your JS bundle is the most important factor. Here are your options, in order of most likely use case.

The best choice is **specific to your use case!** Please review each option according to which fit your use case.

The first 3 will work in any SSG or web page. The last is 11ty specific.

---

## Default Choice: `<iframe>`

This method provides the best performance isolation and is the simplest to implement. It loads the component in a separate environment, so it can't block your host page, and it's lazy-loaded by the browser for free.

* **How:** Create a minimal HTML file (e.g., `app.html`) that contains *only* your component and its script tag. Then, embed it on your 11ty page.
    ```html
    <iframe 
      src="/js/my-bundle.js" 
      loading="lazy" 
      width="100%" 
      height="600px" 
      style="border:0;">
    </iframe>
    ```
* **Best Use Case:** This is your default choice **when your component can have a fixed height** (like `height="600px"`) and doesn't need to communicate with the rest of the page. It's perfect for embedded tools, dashboards, or small widgets.
* **Pro:** Dead simple (one line), native lazy-loading, and total performance isolation (can't block the main thread).
* **Con:** You **must** set a fixed height, which can be awkward on mobile if the component is tall. Also, iframes do not allow styles to merge with the host page.

---

## Phone Default: IntersectionObserver script

This is your best choice when the `iframe`'s fixed-size limitation is a deal-breaker. It ensures the bundle *only* loads when the user scrolls near the component, giving you the fastest possible initial page load.

* **How:** Add your component's tag to the HTML, but *not* its script tag. Then, add a small inline `<script>` to the page to "watch" it.
    ```html
    <my-web-component-app></my-web-component-app>

    <script>
      const lazyComponent = document.querySelector('my-web-component-app');
      if (lazyComponent) {
        const observer = new IntersectionObserver((entries, obs) => {
          if (entries[0].isIntersecting) {
            const script = document.createElement('script');
            script.src = '/js/my-bundle.js';
            script.type = 'module';
            document.head.appendChild(script);
            obs.unobserve(lazyComponent);
          }
        }, { rootMargin: '200px' }); // Load 200px before it's visible
        observer.observe(lazyComponent);
      }
    </script>
    ```
* **Best Use Case:** **When your component must have dynamic height** or reflow naturally with the page. This is the best solution for components on mobile, where a fixed height is not practical.
* **Pro:** Fastest initial page load. Component is part of the main document flow.
* **Con:** More complex to implement and maintain (you need the extra loader script).

---

## Use Case: Component _IS THE PAGE!_
#### Option: The `defer` Attribute

If your component is visible *immediately* when the page loads (e.g., a header element), there's no point in lazy-loading it. Just load it as efficiently as possible.

* **How:** Add the script tag to the specific page that uses it (not the main layout), and use the `defer` attribute.
    ```html
    <script src="/js/my-bundle.js" type="module" defer></script>
    ```
* **Why:** `defer` tells the browser to download the script but wait to run it until *after* the HTML is parsed. This is fast and non-blocking.

## Use Case: Microscopic Componponent on Every 11ty Page
#### Option: In the Global `<head>`

This is the old-school method, and is harmful to MPA performance.

* **How:** Adding `<script src="/js/my-bundle.js"></script>` to your main `_includes/my-layout.njk` file.
* **Why Not:** This forces *every single page on your site* (your blog, your about page, etc.) to download, parse, and execute the app bundle, even if it's not used. It could destroy your Lighthouse scores on unrelated pages.
* **Only Use If:** The script is tiny and *genuinely* needed on 100% of your pages.