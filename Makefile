#
# Copyright (C) 2020 gSpot (https://github.com/gSpotx2f/luci-app-temp-status)
#
# This is free software, licensed under the MIT License.
#

include $(TOPDIR)/rules.mk

LUCI_NAME:=luci-app-temp-status
PKG_VERSION:=0.4
PKG_RELEASE:=20240122

LUCI_TITLE:=Temperature sensors data for the LuCI status page
LUCI_PKGARCH:=all
PKG_LICENSE:=MIT

define Package/$(LUCI_NAME)/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	/etc/init.d/rpcd restart
fi
endef

define Package/$(LUCI_NAME)/prerm
endef

#include ../../luci.mk
include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
