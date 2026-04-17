self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Notificación Pokémon", body: "Tienes una nueva notificación" };
  const options = {
    body: data.body,
    data: { url: data.url || "/" }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data.url || "/";
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
