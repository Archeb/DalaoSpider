/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50547
Source Host           : 127.0.0.1:3306
Source Database       : dalaospider

Target Server Type    : MYSQL
Target Server Version : 50547
File Encoding         : 65001

Date: 2017-02-10 21:37:45
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for links
-- ----------------------------
DROP TABLE IF EXISTS `links`;
CREATE TABLE `links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `FromSiteID` int(11) DEFAULT NULL,
  `FromSiteURL` varchar(255) DEFAULT NULL,
  `ToSiteID` int(11) DEFAULT NULL,
  `ToSiteURL` varchar(255) DEFAULT NULL,
  `ToSiteDesc` varchar(255) DEFAULT NULL,
  `AddTime` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of links
-- ----------------------------

-- ----------------------------
-- Table structure for sites
-- ----------------------------
DROP TABLE IF EXISTS `sites`;
CREATE TABLE `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Domain` varchar(255) NOT NULL,
  `LinkCount` varchar(255) NOT NULL,
  `LinkToCount` varchar(255) NOT NULL,
  `Scan` int(1) unsigned zerofill NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sites
-- ----------------------------
INSERT INTO `sites` VALUES ('12', 'Anotherhome', 'www.anotherhome.net', '', '', '0');
INSERT INTO `sites` VALUES ('14', '初心を忘れず', 'ricterz.me', '', '', '0');
INSERT INTO `sites` VALUES ('11', '贫困的蚊子', 'qwq.moe', '', '', '0');
INSERT INTO `sites` VALUES ('10', 'Note of bobo', 'bobiji.com', '', '', '0');
INSERT INTO `sites` VALUES ('17', 'aNLab', 'www.angelic47.com', '', '', '0');
INSERT INTO `sites` VALUES ('18', 'Loli Tech', 'satori.moe', '', '', '0');
