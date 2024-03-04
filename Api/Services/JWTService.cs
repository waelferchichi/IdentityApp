using Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Api.Services
{
    public class JWTService
    {
        private readonly IConfiguration _config;
        private readonly UserManager<User> _userManger;
        private readonly SymmetricSecurityKey _jwtkey;

        public JWTService(IConfiguration config, UserManager<User> userManger)
        {
            _config = config;
            _userManger = userManger;

            // jwtKey is used for both encripting and descripting the JWT token
            _jwtkey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]));
        }
        public async Task<string> CreateJWT(User user)
        {
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id),
                //new Claim(ClaimTypes.Email,user.Email ?? ""),
                new Claim(ClaimTypes.Email,user.UserName),
                new Claim(ClaimTypes.GivenName,user.FirstName),
                new Claim(ClaimTypes.Surname,user.LastName)
                //new Claim("my own claim name", "this is the value")
            };

            var roles = await _userManger.GetRolesAsync(user);
            userClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var creadentials = new SigningCredentials(_jwtkey, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(userClaims),
                Expires = DateTime.UtcNow.AddDays(int.Parse(_config["JWT:ExpiresInDays"])),
                SigningCredentials = creadentials,
                Issuer = _config["JWT:Issuer"]
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(jwt);
        }
    }
}
