package com.swaply.userservice.mapper;

import com.swaply.userservice.dto.user.UserDto;
import com.swaply.userservice.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto entityToDto(User user);
    User dtoToEntity(UserDto userDto);

}
