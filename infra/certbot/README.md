# SSL Certificate Setup with Certbot

## Initial Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d panhandleaviationalliance.org -d www.panhandleaviationalliance.org

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Renewal

Certbot sets up a systemd timer for automatic renewal. Verify with:

```bash
sudo systemctl status certbot.timer
```

## Manual Renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```
